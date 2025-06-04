import { prisma } from "../../database/client";
import { ApiError } from "../../utils/ApiError";
import {
  HttpStatus,
  ICreateProject,
  IUpdateProject,
} from "@app/shared-types";

export const projectService = {
  async createProject(data: ICreateProject) {
    // Check if project key is unique within workspace
    const existingProject = await prisma.project.findUnique({
      where: {
        workspaceId_key: {
          workspaceId: data.workspaceId,
          key: data.key,
        },
      },
    });

    if (existingProject) {
      throw new ApiError(
        "Project key already exists in this workspace",
        HttpStatus.CONFLICT
      );
    }

    const project = await prisma.project.create({
      data,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        lead: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            requirements: true,
            lists: true,
          },
        },
      },
    });

    // Create default lists for the project
    await this.createDefaultLists(project.id);

    return project;
  },

  async createDefaultLists(projectId: string) {
    const defaultLists = [
      { name: "Backlog", position: 0, color: "#6b7280" },
      { name: "To Do", position: 1, color: "#3b82f6" },
      { name: "In Progress", position: 2, color: "#f59e0b" },
      { name: "In Review", position: 3, color: "#8b5cf6" },
      { name: "Done", position: 4, color: "#10b981" },
    ];

    await prisma.list.createMany({
      data: defaultLists.map((list) => ({
        ...list,
        projectId,
      })),
    });
  },

  async getProjects(filters: {
    workspaceId: string;
    spaceId?: string;
    folderId?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { workspaceId, spaceId, folderId, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId,
    };

    if (spaceId) where.spaceId = spaceId;
    if (folderId) where.folderId = folderId;
    if (status) where.status = status;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          space: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              requirements: true,
              lists: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        lead: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            requirements: true,
            lists: true,
            personas: true,
            sprints: true,
          },
        },
      },
    });

    return project;
  },

  async updateProject(projectId: string, data: IUpdateProject) {
    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        lead: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    return project;
  },

  async deleteProject(projectId: string) {
    // Cascade delete will handle related records
    await prisma.project.delete({
      where: { id: projectId },
    });
  },

  async getProjectStats(projectId: string) {
    const [taskStats, requirementStats, recentActivity] = await Promise.all([
      // Task statistics by status
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId },
        _count: true,
      }),
      // Requirement statistics by type and status
      prisma.requirement.groupBy({
        by: ["type", "status"],
        where: { projectId },
        _count: true,
      }),
      // Recent activities
      prisma.activity.findMany({
        where: {
          task: {
            projectId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              number: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    return {
      tasks: taskStats,
      requirements: requirementStats,
      recentActivity,
    };
  },

  // List management within projects
  async createList(data: {
    name: string;
    description?: string;
    color?: string;
    projectId: string;
  }) {
    // Get current max position
    const maxPosition = await prisma.list.aggregate({
      where: { projectId: data.projectId },
      _max: { position: true },
    });

    const list = await prisma.list.create({
      data: {
        ...data,
        position: (maxPosition._max.position || 0) + 1,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return list;
  },

  async getProjectLists(projectId: string) {
    const lists = await prisma.list.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return lists;
  },

  async getListById(listId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!list) {
      throw new ApiError("List not found", HttpStatus.NOT_FOUND);
    }

    return list;
  },

  async updateList(
    listId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      position?: number;
    }
  ) {
    const list = await prisma.list.update({
      where: { id: listId },
      data,
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return list;
  },

  async deleteList(listId: string) {
    // Check if list has tasks
    const taskCount = await prisma.task.count({
      where: { listId },
    });

    if (taskCount > 0) {
      throw new ApiError(
        "Cannot delete list with tasks. Move tasks to another list first.",
        HttpStatus.BAD_REQUEST
      );
    }

    await prisma.list.delete({
      where: { id: listId },
    });
  },

  async reorderLists(projectId: string, listIds: string[]) {
    // First validate that all lists belong to the specified project
    const lists = await prisma.list.findMany({
      where: {
        id: { in: listIds },
        projectId: projectId,
      },
      select: { id: true },
    });

    if (lists.length !== listIds.length) {
      throw new ApiError(
        "Some lists do not belong to the specified project",
        HttpStatus.BAD_REQUEST
      );
    }

    // Update positions for all lists
    const updates = listIds.map((listId, index) =>
      prisma.list.update({
        where: {
          id: listId,
          projectId: projectId, // Additional safety check
        },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
  },

  // Space and Folder management
  async createSpace(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    workspaceId: string;
  }) {
    const space = await prisma.space.create({
      data,
      include: {
        _count: {
          select: {
            folders: true,
            projects: true,
          },
        },
      },
    });

    return space;
  },

  async createFolder(data: {
    name: string;
    description?: string;
    color?: string;
    spaceId: string;
    parentId?: string;
  }) {
    const folder = await prisma.folder.create({
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            projects: true,
          },
        },
      },
    });

    return folder;
  },

  async getWorkspaceSpaces(workspaceId: string) {
    const spaces = await prisma.space.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: {
            folders: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return spaces;
  },

  async getSpaceFolders(spaceId: string) {
    const folders = await prisma.folder.findMany({
      where: { spaceId },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
            projects: true,
          },
        },
      },
      orderBy: [{ parentId: "asc" }, { createdAt: "asc" }],
    });

    return folders;
  },
};
