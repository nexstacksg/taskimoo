import { Request, Response } from "express";
import { projectService } from "../../services/project/projectService";
import { workspaceService } from "../../services/workspace/workspaceService";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus, UserRole } from "@app/shared-types";

export const projectController = {
  async createProject(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = req.body;

    // Check if user has access to the workspace
    const hasAccess = await workspaceService.checkUserPermission(
      data.workspaceId,
      userId,
      [UserRole.ADMIN]
    );

    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const project = await projectService.createProject(data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: project,
    });
  },

  async getProjects(req: Request, res: Response) {
    const userId = req.user!.id;
    const {
      workspaceId,
      spaceId,
      folderId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    if (!workspaceId) {
      throw new ApiError("Workspace ID is required", HttpStatus.BAD_REQUEST);
    }

    // Check if user has access to the workspace
    const hasAccess = await workspaceService.checkUserAccess(
      String(workspaceId),
      userId
    );
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const result = await projectService.getProjects({
      workspaceId: String(workspaceId),
      spaceId: spaceId as string,
      folderId: folderId as string,
      status: status as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async getProject(req: Request, res: Response) {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await projectService.getProjectById(projectId);

    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access to the workspace
    const hasAccess = await workspaceService.checkUserAccess(
      project.workspaceId,
      userId
    );
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    res.json({
      success: true,
      data: project,
    });
  },

  async updateProject(req: Request, res: Response) {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission to update
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN", "WRITE"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const updatedProject = await projectService.updateProject(projectId, data);

    res.json({
      success: true,
      data: updatedProject,
    });
  },

  async deleteProject(req: Request, res: Response) {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission to delete
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    await projectService.deleteProject(projectId);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  },

  async createList(req: Request, res: Response) {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN", "WRITE"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const list = await projectService.createList({
      ...data,
      projectId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: list,
    });
  },

  async getLists(req: Request, res: Response) {
    const { projectId } = req.params;
    const userId = req.user!.id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(
      project.workspaceId,
      userId
    );
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const lists = await projectService.getProjectLists(projectId);

    res.json({
      success: true,
      data: lists,
    });
  },

  async updateList(req: Request, res: Response) {
    const { projectId, listId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN", "WRITE"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const list = await projectService.updateList(listId, data);

    res.json({
      success: true,
      data: list,
    });
  },

  async deleteList(req: Request, res: Response) {
    const { projectId, listId } = req.params;
    const userId = req.user!.id;

    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    await projectService.deleteList(listId);

    res.json({
      success: true,
      message: "List deleted successfully",
    });
  },
};
