import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import {
  HttpStatus,
  ICreateTask,
  IUpdateTask,
} from "@app/shared-types";

export const taskService = {
  async createTask(data: ICreateTask & { reporterId: string }) {
    // Get next task number for the project
    const lastTask = await prisma.task.findFirst({
      where: { projectId: data.projectId },
      orderBy: { number: "desc" },
    });

    const number = lastTask ? lastTask.number + 1 : 1;

    const task = await prisma.task.create({
      data: {
        ...data,
        number,
        reporterId: data.reporterId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
    });

    return task;
  },

  async getTasks(filters: {
    projectId: string;
    listId?: string;
    status?: string;
    priority?: string;
    type?: string;
    assigneeId?: string;
    parentId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { projectId, listId, status, priority, type, assigneeId, parentId, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = { projectId };

    if (listId) where.listId = listId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (parentId) where.parentId = parentId;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          list: {
            select: {
              id: true,
              name: true,
            },
          },
          parent: {
            select: {
              id: true,
              title: true,
              number: true,
            },
          },
          children: {
            select: {
              id: true,
              title: true,
              number: true,
              status: true,
            },
          },
          _count: {
            select: {
              comments: true,
              checklists: true,
              timeTracking: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getTaskById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            number: true,
            status: true,
          },
        },
        dependents: {
          include: {
            dependsOn: {
              select: {
                id: true,
                title: true,
                number: true,
                status: true,
              },
            },
          },
        },
        dependencies: {
          include: {
            dependent: {
              select: {
                id: true,
                title: true,
                number: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            checklists: true,
            timeTracking: true,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    return task;
  },

  async updateTask(taskId: string, data: IUpdateTask, userId: string) {
    const existingTask = await this.getTaskById(taskId);

    // Track what changed for activity log
    const changes: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key as keyof IUpdateTask] !== existingTask[key as keyof typeof existingTask]) {
        changes[key] = {
          from: existingTask[key as keyof typeof existingTask],
          to: data[key as keyof IUpdateTask],
        };
      }
    });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create activity log if there were changes
    if (Object.keys(changes).length > 0) {
      await prisma.activity.create({
        data: {
          taskId,
          userId,
          type: "UPDATE",
          changes: JSON.stringify(changes),
        },
      });
    }

    return task;
  },

  async deleteTask(taskId: string) {
    // Check if task has children (subtasks)
    const childCount = await prisma.task.count({
      where: { parentId: taskId },
    });

    if (childCount > 0) {
      throw new ApiError(
        "Cannot delete task with subtasks. Delete subtasks first or move them to another parent.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Delete related data first
    await prisma.$transaction([
      // Delete time entries
      prisma.timeTracking.deleteMany({ where: { taskId } }),
      // Delete checklist items
      prisma.checklistItem.deleteMany({
        where: {
          checklist: {
            taskId,
          },
        },
      }),
      // Delete checklists
      prisma.checklist.deleteMany({ where: { taskId } }),
      // Delete comments
      prisma.comment.deleteMany({ where: { taskId } }),
      // Delete dependencies
      prisma.taskDependency.deleteMany({
        where: {
          OR: [{ dependentId: taskId }, { dependsOnId: taskId }],
        },
      }),
      // Delete task links
      prisma.taskLink.deleteMany({
        where: {
          OR: [{ sourceTaskId: taskId }, { targetTaskId: taskId }],
        },
      }),
      // Delete activity logs
      prisma.activity.deleteMany({ where: { taskId } }),
      // Finally delete the task
      prisma.task.delete({ where: { id: taskId } }),
    ]);
  },

  async bulkUpdateTasks(
    taskIds: string[],
    data: Partial<IUpdateTask>,
    userId: string
  ) {
    const updates = taskIds.map((taskId) =>
      this.updateTask(taskId, data, userId)
    );

    const results = await Promise.allSettled(updates);

    const successful: any[] = [];
    const failed: any[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push({ taskId: taskIds[index], error: result.reason.message });
      }
    });

    return { successful, failed };
  },

  async reorderTasks(listId: string, taskIds: string[]) {
    // First validate that all tasks belong to the specified list
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        listId: listId,
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      throw new ApiError(
        "Some tasks do not belong to the specified list",
        HttpStatus.BAD_REQUEST
      );
    }

    // Update positions for all tasks in the list
    const updates = taskIds.map((taskId, index) =>
      prisma.task.update({
        where: { 
          id: taskId,
          listId: listId, // Additional safety check
        },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
  },
};