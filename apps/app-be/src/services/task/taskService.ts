import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import {
  HttpStatus,
  ICreateTask,
  IUpdateTask,
  TaskStatus,
} from "@app/shared-types";

export const taskService = {
  async createTask(data: ICreateTask & { reporterId: string }) {
    // Get next task number for the project
    const lastTask = await prisma.task.findFirst({
      where: { projectId: data.projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const nextNumber = (lastTask?.number || 0) + 1;

    // Get position for the list
    let position = 0;
    if (data.listId) {
      const lastTaskInList = await prisma.task.findFirst({
        where: { listId: data.listId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = (lastTaskInList?.position || 0) + 1;
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        number: nextNumber,
        position,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Create activity log
    await this.createActivity({
      type: "task_created",
      taskId: task.id,
      userId: data.reporterId,
      changes: {
        title: task.title,
        status: task.status,
        priority: task.priority,
        type: task.type,
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
    const {
      projectId,
      listId,
      status,
      priority,
      type,
      assigneeId,
      parentId,
      search,
      page,
      limit,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      projectId,
    };

    if (listId) where.listId = listId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (assigneeId) where.assigneeId = assigneeId;
    if (parentId !== undefined) {
      where.parentId = parentId === "null" ? null : parentId;
    }
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
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          reporter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          list: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          parent: {
            select: {
              id: true,
              title: true,
              number: true,
            },
          },
          _count: {
            select: {
              children: true,
              comments: true,
              attachments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getTaskById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            color: true,
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
            priority: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        dependencies: {
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
        dependents: {
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
            attachments: true,
            checklists: true,
            timeTracking: true,
          },
        },
      },
    });

    return task;
  },

  async updateTask(taskId: string, data: IUpdateTask, userId: string) {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        status: true,
        priority: true,
        assigneeId: true,
        listId: true,
        title: true,
        description: true,
        dueDate: true,
        estimatedHours: true,
        storyPoints: true,
      },
    });

    if (!currentTask) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Handle position updates if moving between lists
    let position = data.position;
    if (data.listId && data.listId !== currentTask.listId) {
      if (position === undefined) {
        // Get position at end of new list
        const lastTaskInList = await prisma.task.findFirst({
          where: { listId: data.listId },
          orderBy: { position: "desc" },
          select: { position: true },
        });
        position = (lastTaskInList?.position || 0) + 1;
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data,
        position,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    // Track changes for activity log
    const changes: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const currentValue = (currentTask as any)[key];
      const newValue = (data as any)[key];
      if (currentValue !== newValue) {
        changes[key] = { from: currentValue, to: newValue };
      }
    });

    if (Object.keys(changes).length > 0) {
      await this.createActivity({
        type: "task_updated",
        taskId,
        userId,
        changes,
      });
    }

    return task;
  },

  async deleteTask(taskId: string) {
    // Check if task has children
    const childCount = await prisma.task.count({
      where: { parentId: taskId },
    });

    if (childCount > 0) {
      throw new ApiError(
        "Cannot delete task with subtasks. Delete subtasks first.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Cascade delete will handle related records
    await prisma.task.delete({
      where: { id: taskId },
    });
  },

  async createActivity(data: {
    type: string;
    taskId: string;
    userId: string;
    changes: Record<string, any>;
  }) {
    await prisma.activity.create({
      data: {
        type: data.type,
        taskId: data.taskId,
        userId: data.userId,
        changes: JSON.stringify(data.changes),
      },
    });
  },

  async getTaskActivities(taskId: string) {
    const activities = await prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return activities.map((activity) => ({
      ...activity,
      changes: JSON.parse(activity.changes),
    }));
  },

  // Comments
  async addComment(data: {
    taskId: string;
    authorId: string;
    content: string;
    parentId?: string;
    mentions?: string[];
  }) {
    const comment = await prisma.comment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Create activity
    await this.createActivity({
      type: "comment_added",
      taskId: data.taskId,
      userId: data.authorId,
      changes: {
        commentId: comment.id,
        content: data.content,
      },
    });

    return comment;
  },

  async getTaskComments(taskId: string) {
    const comments = await prisma.comment.findMany({
      where: {
        taskId,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return comments;
  },

  // Checklists
  async addChecklist(data: { taskId: string; title: string; items: string[] }) {
    const checklist = await prisma.checklist.create({
      data: {
        taskId: data.taskId,
        title: data.title,
        items: {
          create: data.items.map((content, index) => ({
            content,
            position: index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return checklist;
  },

  async updateChecklistItem(itemId: string, data: { isCompleted: boolean }) {
    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data,
    });

    return item;
  },

  // Time tracking
  async trackTime(data: {
    taskId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    description?: string;
  }) {
    let duration: number | undefined;

    if (data.endTime) {
      duration = Math.floor(
        (data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60)
      ); // minutes
    }

    const timeEntry = await prisma.timeTracking.create({
      data: {
        ...data,
        duration,
      },
    });

    return timeEntry;
  },

  async getTaskTimeTracking(taskId: string) {
    const timeEntries = await prisma.timeTracking.findMany({
      where: { taskId },
      orderBy: {
        startTime: "desc",
      },
    });

    return timeEntries;
  },

  // Task dependencies
  async addDependency(
    dependentId: string,
    dependsOnId: string,
    type: string = "FINISH_TO_START"
  ) {
    // Check for circular dependencies
    const wouldCreateCycle = await this.checkCircularDependency(
      dependentId,
      dependsOnId
    );
    if (wouldCreateCycle) {
      throw new ApiError(
        "Cannot create dependency: would create circular dependency",
        HttpStatus.BAD_REQUEST
      );
    }

    const dependency = await prisma.taskDependency.create({
      data: {
        dependentId,
        dependsOnId,
        type,
      },
      include: {
        dependent: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
        dependsOn: {
          select: {
            id: true,
            title: true,
            number: true,
            status: true,
          },
        },
      },
    });

    return dependency;
  },

  async checkCircularDependency(
    taskId: string,
    potentialDependencyId: string
  ): Promise<boolean> {
    // Simple check: if potentialDependencyId depends on taskId (directly or indirectly)
    // then adding taskId -> potentialDependencyId would create a cycle

    const visited = new Set<string>();
    const stack = [potentialDependencyId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;

      if (visited.has(currentId)) continue;
      if (currentId === taskId) return true;

      visited.add(currentId);

      // Get all tasks that currentId depends on
      const dependencies = await prisma.taskDependency.findMany({
        where: { dependentId: currentId },
        select: { dependsOnId: true },
      });

      for (const dep of dependencies) {
        stack.push(dep.dependsOnId);
      }
    }

    return false;
  },

  async removeDependency(dependentId: string, dependsOnId: string) {
    await prisma.taskDependency.delete({
      where: {
        dependentId_dependsOnId: {
          dependentId,
          dependsOnId,
        },
      },
    });
  },

  // Bulk operations
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
    // Update positions for all tasks in the list
    const updates = taskIds.map((taskId, index) =>
      prisma.task.update({
        where: { id: taskId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
  },
};
