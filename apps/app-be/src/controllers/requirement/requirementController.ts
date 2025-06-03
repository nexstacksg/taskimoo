import { Request, Response } from 'express';
import { requirementService } from '../../services/requirement/requirementService';
import { projectService } from '../../services/project/projectService';
import { workspaceService } from '../../services/workspace/workspaceService';
import { ApiError } from '../../utils/ApiError';
import { HttpStatus } from '@app/shared-types';

export const requirementController = {
  async createRequirement(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = req.body;

    // Get project to check workspace access
    const project = await projectService.getProjectById(data.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission to create requirements
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ['OWNER', 'ADMIN', 'WRITE']
    );

    if (!hasPermission) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const requirement = await requirementService.createRequirement({
      ...data,
      authorId: userId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: requirement,
    });
  },

  async getRequirements(req: Request, res: Response) {
    const userId = req.user!.id;
    const { 
      projectId, 
      type, 
      status, 
      priority,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!projectId) {
      throw new ApiError('Project ID is required', HttpStatus.BAD_REQUEST);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(String(projectId));
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const result = await requirementService.getRequirements({
      projectId: String(projectId),
      type: type as string,
      status: status as string,
      priority: priority as string,
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

  async getRequirement(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    res.json({
      success: true,
      data: requirement,
    });
  },

  async updateRequirement(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ['OWNER', 'ADMIN', 'WRITE']
    );

    if (!hasPermission) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const updatedRequirement = await requirementService.updateRequirement(
      requirementId, 
      data,
      userId
    );

    res.json({
      success: true,
      data: updatedRequirement,
    });
  },

  async deleteRequirement(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ['OWNER', 'ADMIN']
    );

    if (!hasPermission) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    await requirementService.deleteRequirement(requirementId);

    res.json({
      success: true,
      message: 'Requirement deleted successfully',
    });
  },

  async analyzeRequirement(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const analysis = await requirementService.analyzeRequirement(requirementId);

    res.json({
      success: true,
      data: analysis,
    });
  },

  async generateTestCases(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ['OWNER', 'ADMIN', 'WRITE']
    );

    if (!hasPermission) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const testCases = await requirementService.generateTestCases(requirementId);

    res.json({
      success: true,
      data: testCases,
    });
  },

  async getRequirementHistory(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has access
    const hasAccess = await workspaceService.checkUserAccess(project.workspaceId, userId);
    if (!hasAccess) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const history = await requirementService.getRequirementHistory(requirementId);

    res.json({
      success: true,
      data: history,
    });
  },

  async linkRequirementToTask(req: Request, res: Response) {
    const { requirementId } = req.params;
    const userId = req.user!.id;
    const { taskId } = req.body;

    const requirement = await requirementService.getRequirementById(requirementId);
    if (!requirement) {
      throw new ApiError('Requirement not found', HttpStatus.NOT_FOUND);
    }

    // Get project to check workspace access
    const project = await projectService.getProjectById(requirement.projectId);
    if (!project) {
      throw new ApiError('Project not found', HttpStatus.NOT_FOUND);
    }

    // Check if user has permission
    const hasPermission = await workspaceService.checkUserPermission(
      project.workspaceId,
      userId,
      ['OWNER', 'ADMIN', 'WRITE']
    );

    if (!hasPermission) {
      throw new ApiError('Access denied', HttpStatus.FORBIDDEN);
    }

    const link = await requirementService.linkToTask(requirementId, taskId);

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: link,
    });
  },
};