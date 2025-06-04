import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskTimeTrackingService = {
  async trackTime(data: {
    taskId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    description?: string;
  }) {
    // If no endTime provided, this is starting a time entry
    if (!data.endTime) {
      // Check if user has any active time entries for this task
      const activeEntry = await prisma.timeTracking.findFirst({
        where: {
          taskId: data.taskId,
          userId: data.userId,
          endTime: null,
        },
      });

      if (activeEntry) {
        throw new ApiError(
          "User already has an active time entry for this task",
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const timeEntry = await prisma.timeTracking.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        type: data.endTime ? "TIME_LOGGED" : "TIME_STARTED",
        changes: JSON.stringify({
          timeEntry: {
            action: data.endTime ? "logged" : "started",
            duration: data.endTime
              ? this.calculateDuration(data.startTime, data.endTime)
              : null,
          },
        }),
      },
    });

    return timeEntry;
  },

  async stopTimeTracking(entryId: string, endTime: Date, userId: string) {
    const entry = await prisma.timeTracking.findUnique({
      where: { id: entryId },
      select: {
        userId: true,
        taskId: true,
        startTime: true,
      },
    });

    if (!entry) {
      throw new ApiError("Time entry not found", HttpStatus.NOT_FOUND);
    }

    if (entry.userId !== userId) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const updatedEntry = await prisma.timeTracking.update({
      where: { id: entryId },
      data: { endTime },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: entry.taskId,
        userId,
        type: "TIME_STOPPED",
        changes: JSON.stringify({
          timeEntry: {
            action: "stopped",
            duration: this.calculateDuration(entry.startTime, endTime),
          },
        }),
      },
    });

    return updatedEntry;
  },

  async getTaskTimeTracking(taskId: string) {
    const timeEntries = await prisma.timeTracking.findMany({
      where: { taskId },
      orderBy: { startTime: "desc" },
    });

    // Calculate totals
    let totalTime = 0;
    const userTotals: Record<string, number> = {};

    timeEntries.forEach((entry) => {
      if (entry.endTime) {
        const duration = entry.endTime.getTime() - entry.startTime.getTime();
        totalTime += duration;

        if (!userTotals[entry.userId]) {
          userTotals[entry.userId] = 0;
        }
        userTotals[entry.userId] += duration;
      }
    });

    return {
      entries: timeEntries,
      summary: {
        totalTime: this.formatDuration(totalTime),
        totalTimeMs: totalTime,
        userTotals: Object.entries(userTotals).map(([userId, time]) => ({
          userId,
          time: this.formatDuration(time),
          timeMs: time,
        })),
      },
    };
  },

  async getUserTimeTracking(
    userId: string,
    filters: {
      taskId?: string;
      projectId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { userId };

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.projectId) {
      where.task = {
        projectId: filters.projectId,
      };
    }

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    const timeEntries = await prisma.timeTracking.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            number: true,
            project: {
              select: {
                id: true,
                name: true,
                key: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    // Calculate total time
    let totalTime = 0;
    timeEntries.forEach((entry) => {
      if (entry.endTime) {
        totalTime += entry.endTime.getTime() - entry.startTime.getTime();
      }
    });

    return {
      entries: timeEntries,
      summary: {
        totalTime: this.formatDuration(totalTime),
        totalTimeMs: totalTime,
      },
    };
  },

  async updateTimeEntry(
    entryId: string,
    data: {
      startTime?: Date;
      endTime?: Date;
      description?: string;
    },
    userId: string
  ) {
    const entry = await prisma.timeTracking.findUnique({
      where: { id: entryId },
      select: {
        userId: true,
        taskId: true,
      },
    });

    if (!entry) {
      throw new ApiError("Time entry not found", HttpStatus.NOT_FOUND);
    }

    if (entry.userId !== userId) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const updatedEntry = await prisma.timeTracking.update({
      where: { id: entryId },
      data,
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: entry.taskId,
        userId,
        type: "TIME_UPDATED",
        changes: JSON.stringify({ timeEntry: { updated: true } }),
      },
    });

    return updatedEntry;
  },

  async deleteTimeEntry(entryId: string, userId: string) {
    const entry = await prisma.timeTracking.findUnique({
      where: { id: entryId },
      select: {
        userId: true,
        taskId: true,
      },
    });

    if (!entry) {
      throw new ApiError("Time entry not found", HttpStatus.NOT_FOUND);
    }

    if (entry.userId !== userId) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    await prisma.timeTracking.delete({
      where: { id: entryId },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        taskId: entry.taskId,
        userId,
        type: "TIME_DELETED",
        changes: JSON.stringify({ timeEntry: { deleted: true } }),
      },
    });
  },

  // Utility methods
  calculateDuration(startTime: Date, endTime: Date): string {
    const diffMs = endTime.getTime() - startTime.getTime();
    return this.formatDuration(diffMs);
  },

  formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },

  async getActiveTimeEntry(taskId: string, userId: string) {
    const activeEntry = await prisma.timeTracking.findFirst({
      where: {
        taskId,
        userId,
        endTime: null,
      },
    });

    return activeEntry;
  },
};
