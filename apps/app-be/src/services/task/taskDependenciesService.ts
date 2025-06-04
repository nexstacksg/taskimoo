import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskDependenciesService = {
  async addDependency(
    dependentId: string,
    dependsOnId: string,
    userId: string
  ) {
    // Validate both tasks exist
    const [dependent, dependsOn] = await Promise.all([
      prisma.task.findUnique({ where: { id: dependentId } }),
      prisma.task.findUnique({ where: { id: dependsOnId } }),
    ]);

    if (!dependent || !dependsOn) {
      throw new ApiError("One or both tasks not found", HttpStatus.NOT_FOUND);
    }

    // Check if dependency already exists
    const existingDependency = await prisma.taskDependency.findFirst({
      where: {
        dependentId,
        dependsOnId,
      },
    });

    if (existingDependency) {
      throw new ApiError("Dependency already exists", HttpStatus.CONFLICT);
    }

    // Check for circular dependency
    const wouldCreateCircular = await this.checkCircularDependency(
      dependentId,
      dependsOnId
    );
    if (wouldCreateCircular) {
      throw new ApiError(
        "Cannot create dependency: would create circular dependency",
        HttpStatus.BAD_REQUEST
      );
    }

    const dependency = await prisma.taskDependency.create({
      data: {
        dependentId,
        dependsOnId,
      },
      include: {
        dependent: {
          select: {
            id: true,
            title: true,
            number: true,
            status: true,
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

    // Create activity logs
    await Promise.all([
      prisma.activity.create({
        data: {
          taskId: dependentId,
          userId: userId,
          type: "DEPENDENCY_ADDED",
          changes: JSON.stringify({
            activity: `Added dependency on task ${dependsOn.number}: ${dependsOn.title}`,
          }),
        },
      }),
      prisma.activity.create({
        data: {
          taskId: dependsOnId,
          userId: userId,
          type: "DEPENDENCY_ADDED",
          changes: JSON.stringify({
            activity: `Task ${dependent.number}: ${dependent.title} now depends on this task`,
          }),
        },
      }),
    ]);

    return dependency;
  },

  async removeDependency(
    dependentId: string,
    dependsOnId: string,
    userId: string
  ) {
    const dependency = await prisma.taskDependency.findFirst({
      where: {
        dependentId,
        dependsOnId,
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
          },
        },
      },
    });

    if (!dependency) {
      throw new ApiError("Dependency not found", HttpStatus.NOT_FOUND);
    }

    await prisma.taskDependency.delete({
      where: { id: dependency.id },
    });

    // Create activity logs
    await Promise.all([
      prisma.activity.create({
        data: {
          taskId: dependentId,
          userId: userId,
          type: "DEPENDENCY_REMOVED",
          changes: JSON.stringify({
            activity: `Removed dependency on task ${dependency.dependsOn.number}: ${dependency.dependsOn.title}`,
          }),
        },
      }),
      prisma.activity.create({
        data: {
          taskId: dependsOnId,
          userId: userId,
          type: "DEPENDENCY_REMOVED",
          changes: JSON.stringify({
            activity: `Task ${dependency.dependent.number}: ${dependency.dependent.title} no longer depends on this task`,
          }),
        },
      }),
    ]);
  },

  async getTaskDependencies(taskId: string) {
    const [dependsOn, dependents] = await Promise.all([
      // Tasks this task depends on (blockers)
      prisma.taskDependency.findMany({
        where: { dependentId: taskId },
        include: {
          dependsOn: {
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
                },
              },
            },
          },
        },
      }),
      // Tasks that depend on this task (blocked tasks)
      prisma.taskDependency.findMany({
        where: { dependsOnId: taskId },
        include: {
          dependent: {
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
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      dependsOn: dependsOn.map((d) => d.dependsOn),
      dependents: dependents.map((d) => d.dependent),
    };
  },

  async checkCircularDependency(
    dependentId: string,
    dependsOnId: string
  ): Promise<boolean> {
    // If the task we want to depend on already depends on the dependent task,
    // that would create a circular dependency
    const visited = new Set<string>();

    const hasPath = async (fromId: string, toId: string): Promise<boolean> => {
      if (fromId === toId) return true;
      if (visited.has(fromId)) return false;

      visited.add(fromId);

      const dependencies = await prisma.taskDependency.findMany({
        where: { dependentId: fromId },
        select: { dependsOnId: true },
      });

      for (const dep of dependencies) {
        if (await hasPath(dep.dependsOnId, toId)) {
          return true;
        }
      }

      return false;
    };

    return await hasPath(dependsOnId, dependentId);
  },

  async getDependencyChain(taskId: string): Promise<any[]> {
    const visited = new Set<string>();
    const chain: any[] = [];

    const buildChain = async (
      currentTaskId: string,
      depth = 0
    ): Promise<void> => {
      if (visited.has(currentTaskId) || depth > 10) return; // Prevent infinite loops
      visited.add(currentTaskId);

      const task = await prisma.task.findUnique({
        where: { id: currentTaskId },
        select: {
          id: true,
          title: true,
          number: true,
          status: true,
        },
      });

      if (!task) return;

      chain.push({ ...task, depth });

      const dependencies = await prisma.taskDependency.findMany({
        where: { dependentId: currentTaskId },
        select: { dependsOnId: true },
      });

      for (const dep of dependencies) {
        await buildChain(dep.dependsOnId, depth + 1);
      }
    };

    await buildChain(taskId);
    return chain;
  },

  async getBlockedTasks(projectId?: string) {
    const where: any = {
      dependencies: {
        some: {
          dependsOn: {
            status: {
              notIn: ["DONE", "CANCELLED"],
            },
          },
        },
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const blockedTasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
          where: {
            dependsOn: {
              status: {
                notIn: ["DONE", "CANCELLED"],
              },
            },
          },
        },
      },
    });

    return blockedTasks;
  },

  async getReadyTasks(projectId?: string) {
    // Tasks that have no incomplete dependencies
    const where: any = {
      status: {
        notIn: ["DONE", "CANCELLED"],
      },
      OR: [
        // No dependencies at all
        {
          dependencies: {
            none: {},
          },
        },
        // All dependencies are complete
        {
          dependencies: {
            every: {
              dependsOn: {
                status: {
                  in: ["DONE", "CANCELLED"],
                },
              },
            },
          },
        },
      ],
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const readyTasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
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
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    return readyTasks;
  },

  async bulkAddDependencies(
    dependencies: { dependentId: string; dependsOnId: string }[],
    userId: string
  ) {
    const results: { successful: any[]; failed: any[] } = {
      successful: [],
      failed: [],
    };

    for (const dep of dependencies) {
      try {
        const result = await this.addDependency(
          dep.dependentId,
          dep.dependsOnId,
          userId
        );
        results.successful.push(result);
      } catch (error: any) {
        results.failed.push({
          dependency: dep,
          error: error.message,
        });
      }
    }

    return results;
  },

  async bulkRemoveDependencies(
    dependencies: { dependentId: string; dependsOnId: string }[],
    userId: string
  ) {
    const results: { successful: number; failed: any[] } = {
      successful: 0,
      failed: [],
    };

    for (const dep of dependencies) {
      try {
        await this.removeDependency(dep.dependentId, dep.dependsOnId, userId);
        results.successful++;
      } catch (error: any) {
        results.failed.push({
          dependency: dep,
          error: error.message,
        });
      }
    }

    return results;
  },
};
