import { Request, Response } from "express";
import { taskService } from "../../services/task/taskService";
import { projectService } from "../../services/project/projectService";
import { workspaceService } from "../../services/workspace/workspaceService";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const taskController = {
  async createTask(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = req.body;

    // Get project to check workspace access
    const project = await projectService.getProjectById(data.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has permission to create tasks
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ["OWNER", "ADMIN", "WRITE"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const task = await taskService.createTask({
      ...data,
      reporterId: userId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: task,
    });
  },

  async getTasks(req: Request, res: Response) {
    const userId = req.user!.id;
    const { 
      projectId, 
      listId, 
      status, 
      priority, 
      type,
      assigneeId,
      parentId,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!projectId) {
      throw new ApiError("Project ID is required", HttpStatus.BAD_REQUEST);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(String(projectId));
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const result = await taskService.getTasks({
      projectId: String(projectId),
      listId: listId as string,
      status: status as string,
      priority: priority as string,
      type: type as string,
      assigneeId: assigneeId as string,
      parentId: parentId as string,
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async getTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    res.json({
      success: true,
      data: task,
    });
  },

  async updateTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
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

    const updatedTask = await taskService.updateTask(taskId, data, userId);

    res.json({
      success: true,
      data: updatedTask,
    });
  },

  async deleteTask(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
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

    await taskService.deleteTask(taskId);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  },

  async addComment(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const { content, mentions } = req.body;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const comment = await taskService.addComment({
      taskId,
      authorId: userId,
      content,
      mentions,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: comment,
    });
  },

  async getComments(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const comments = await taskService.getTaskComments(taskId);

    res.json({
      success: true,
      data: comments,
    });
  },

  async addChecklist(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const { title, items } = req.body;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
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

    const checklist = await taskService.addChecklist({
      taskId,
      title,
      items,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: checklist,
    });
  },

  async updateChecklistItem(req: Request, res: Response) {
    const { taskId, checklistId, itemId } = req.params;
    const userId = req.user!.id;
    const { isCompleted } = req.body;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
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

    const item = await taskService.updateChecklistItem(itemId, { isCompleted });

    res.json({
      success: true,
      data: item,
    });
  },

  async trackTime(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const { startTime, endTime, description } = req.body;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const timeEntry = await taskService.trackTime({
      taskId,
      userId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      description,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: timeEntry,
    });
  },

  async getTimeTracking(req: Request, res: Response) {
    const { taskId } = req.params;
    const userId = req.user!.id;

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(task.projectId);
    if (!project) {
      throw new ApiError("Project not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const timeEntries = await taskService.getTaskTimeTracking(taskId);

    res.json({
      success: true,
      data: timeEntries,
    });
  },

  async bulkUpdateTasks(req: Request, res: Response) {
    const userId = req.user!.id;
    const { taskIds, updates } = req.body;

    // Check if user has access to all tasks (by checking first task's project)
    const firstTask = await taskService.getTaskById(taskIds[0]);
    if (!firstTask) {
      throw new ApiError("Task not found", HttpStatus.NOT_FOUND);
    }

    const project = await projectService.getProjectById(firstTask.projectId);
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

    const result = await taskService.bulkUpdateTasks(taskIds, updates, userId);

    res.json({
      success: true,
      data: result,
    });
  },
};