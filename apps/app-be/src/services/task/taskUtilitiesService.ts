import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskUtilitiesService = {
  async getTaskActivity(taskId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return activities;
  },

  async getTaskMetrics(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        _count: {
          select: {
            comments: true,
            checklists: true,
            timeTracking: true,
            dependents: true,
            dependencies: true,
            children: true,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Calculate completion percentage for checklists
    const checklistItems = await prisma.checklistItem.count({
      where: {
        checklist: {
          taskId,
        },
      },
    });

    const completedChecklistItems = await prisma.checklistItem.count({
      where: {
        checklist: {
          taskId,
        },
        isCompleted: true,
      },
    });

    const checklistCompletionRate =
      checklistItems > 0 ? (completedChecklistItems / checklistItems) * 100 : 0;

    // Calculate total time spent
    const timeEntries = await prisma.timeTracking.findMany({
      where: {
        taskId,
        endTime: { not: null },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const totalTimeMs = timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        return total + (entry.endTime.getTime() - entry.startTime.getTime());
      }
      return total;
    }, 0);

    // Calculate subtask completion rate
    const subtasks = await prisma.task.findMany({
      where: { parentId: taskId },
      select: { status: true },
    });

    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.status === "DONE"
    ).length;

    const subtaskCompletionRate =
      subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

    return {
      taskId,
      counts: task._count,
      completionRates: {
        checklists: Math.round(checklistCompletionRate),
        subtasks: Math.round(subtaskCompletionRate),
      },
      timeSpent: {
        totalMs: totalTimeMs,
        formatted: this.formatDuration(totalTimeMs),
      },
      created: task.createdAt,
      updated: task.updatedAt,
    };
  },

  async duplicateTask(
    taskId: string,
    options: {
      includeComments?: boolean;
      includeChecklists?: boolean;
      includeTimeTracking?: boolean;
      includeDependencies?: boolean;
      newTitle?: string;
      newAssigneeId?: string;
      newListId?: string;
    } = {}
  ) {
    const originalTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        comments: options.includeComments,
        checklists: {
          include: {
            items: true,
          },
        },
        timeTracking: options.includeTimeTracking,
        dependents: options.includeDependencies,
        dependencies: options.includeDependencies,
      },
    });

    if (!originalTask) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get next task number
    const lastTask = await prisma.task.findFirst({
      where: { projectId: originalTask.projectId },
      orderBy: { number: "desc" },
    });

    const number = lastTask ? lastTask.number + 1 : 1;

    const duplicatedTask = await prisma.task.create({
      data: {
        title: options.newTitle || `${originalTask.title} (Copy)`,
        description: originalTask.description,
        type: originalTask.type,
        priority: originalTask.priority,
        status: "TODO", // Always start duplicated tasks as TODO
        projectId: originalTask.projectId,
        listId: options.newListId || originalTask.listId,
        assigneeId: options.newAssigneeId || originalTask.assigneeId,
        reporterId: originalTask.reporterId,
        parentId: originalTask.parentId,
        estimatedHours: originalTask.estimatedHours,
        storyPoints: originalTask.storyPoints,
        dueDate: originalTask.dueDate,
        // labels: originalTask.labels, // Remove this line as labels field doesn't exist
        number,
        position: 0, // Will be updated when added to list
      },
    });

    // Duplicate checklists if requested
    if (options.includeChecklists && originalTask.checklists) {
      for (const checklist of originalTask.checklists) {
        await prisma.checklist.create({
          data: {
            taskId: duplicatedTask.id,
            title: checklist.title,
            items: {
              create: checklist.items.map((item, index) => ({
                content: item.content, // Use content instead of title
                isCompleted: false, // Reset completion status
                position: index,
              })),
            },
          },
        });
      }
    }

    // Duplicate comments if requested
    if (options.includeComments && originalTask.comments) {
      for (const comment of originalTask.comments) {
        await prisma.comment.create({
          data: {
            taskId: duplicatedTask.id,
            authorId: comment.authorId,
            content: `[Copied from original task] ${comment.content}`,
            mentions: comment.mentions,
          },
        });
      }
    }

    return duplicatedTask;
  },

  async moveTaskToList(taskId: string, newListId: string, position?: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { listId: true, projectId: true },
    });

    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Validate the new list belongs to the same project
    const newList = await prisma.list.findUnique({
      where: { id: newListId },
      select: { projectId: true },
    });

    if (!newList || newList.projectId !== task.projectId) {
      throw new ApiError(
        "Invalid list or list not in same project",
        HttpStatus.BAD_REQUEST
      );
    }

    // If no position specified, add to end of list
    if (position === undefined) {
      const lastTaskInList = await prisma.task.findFirst({
        where: { listId: newListId },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      position = lastTaskInList ? lastTaskInList.position + 1 : 0;
    }

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        listId: newListId,
        position,
      },
    });

    // Reorder other tasks in the new list if needed
    if (position !== undefined) {
      await prisma.task.updateMany({
        where: {
          listId: newListId,
          id: { not: taskId },
          position: { gte: position },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    }
  },

  async archiveTask(taskId: string, userId: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        // archivedAt: new Date(), // Remove this field if it doesn't exist in schema
        status: "CANCELLED",
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId,
        userId,
        type: "TASK_ARCHIVED",
        changes: JSON.stringify({ status: { from: task.status, to: "CANCELLED" } }),
      },
    });

    return task;
  },

  async unarchiveTask(taskId: string, userId: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        // archivedAt: null, // Remove this field if it doesn't exist in schema
        status: "TODO",
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId,
        userId,
        type: "TASK_UNARCHIVED",
        changes: JSON.stringify({ status: { from: "CANCELLED", to: "TODO" } }),
      },
    });

    return task;
  },

  async getTasksByAssignee(
    assigneeId: string,
    filters?: {
      status?: string;
      priority?: string;
      projectId?: string;
      dueDate?: Date;
    }
  ) {
    const where: any = { assigneeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.dueDate) {
      where.dueDate = { lte: filters.dueDate };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
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
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    });

    return tasks;
  },

  async getOverdueTasks(projectId?: string) {
    const where: any = {
      dueDate: { lt: new Date() },
      status: { notIn: ["DONE", "CANCELLED"] },
      // archivedAt: null, // Remove if field doesn't exist
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
      orderBy: { dueDate: "asc" },
    });

    return tasks;
  },

  // Utility method for formatting duration
  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  async generateTaskReport(
    projectId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      assigneeId?: string;
      status?: string;
    }
  ) {
    const where: any = { projectId };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.status) where.status = filters.status;

    const [
      totalTasks,
      completedTasks,
      averageTimeToComplete,
      tasksByStatus,
      tasksByPriority,
      tasksByAssignee,
    ] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: "DONE" } }),
      this.calculateAverageCompletionTime(projectId, filters),
      this.getTaskCountByStatus(projectId, filters),
      this.getTaskCountByPriority(projectId, filters),
      this.getTaskCountByAssignee(projectId, filters),
    ]);

    return {
      summary: {
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageTimeToComplete,
      },
      breakdown: {
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        byAssignee: tasksByAssignee,
      },
    };
  },

  async calculateAverageCompletionTime(projectId: string, filters?: any) {
    // Implementation for calculating average completion time
    const completedTasks = await prisma.task.findMany({
      where: {
        projectId,
        status: "DONE",
        ...filters,
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime());
    }, 0);

    return totalTime / completedTasks.length;
  },

  async getTaskCountByStatus(projectId: string, filters?: any) {
    const result = await prisma.task.groupBy({
      by: ["status"],
      where: { projectId, ...filters },
      _count: true,
    });

    return result;
  },

  async getTaskCountByPriority(projectId: string, filters?: any) {
    const result = await prisma.task.groupBy({
      by: ["priority"],
      where: { projectId, ...filters },
      _count: true,
    });

    return result;
  },

  async getTaskCountByAssignee(projectId: string, filters?: any) {
    const result = await prisma.task.groupBy({
      by: ["assigneeId"],
      where: { projectId, ...filters },
      _count: true,
    });

    return result;
  },
};
