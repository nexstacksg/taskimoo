import { Request, Response } from "express";
import { workspaceService } from "../../services/workspace/workspaceService";
import { ApiError } from "../../utils/ApiError";
import { HttpStatus } from "@app/shared-types";

export const workspaceController = {
  async createWorkspace(req: Request, res: Response) {
    const userId = req.user!.id;
    const data = req.body;

    const workspace = await workspaceService.createWorkspace({
      ...data,
      ownerId: userId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: workspace,
    });
  },

  async getWorkspaces(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await workspaceService.getUserWorkspaces(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  },

  async getWorkspace(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user!.id;

    const workspace = await workspaceService.getWorkspaceById(workspaceId);

    if (!workspace) {
      throw new ApiError("Workspace not found", HttpStatus.NOT_FOUND);
    }

    // Check if user has access to this workspace
    const hasAccess = await workspaceService.checkUserAccess(
      workspaceId,
      userId
    );
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    res.json({
      success: true,
      data: workspace,
    });
  },

  async updateWorkspace(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const data = req.body;

    // Check if user is owner or admin
    const hasPermission = await workspaceService.checkUserPermission(
      workspaceId,
      userId,
      ["OWNER", "ADMIN"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const workspace = await workspaceService.updateWorkspace(workspaceId, data);

    res.json({
      success: true,
      data: workspace,
    });
  },

  async deleteWorkspace(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user!.id;

    // Only owner can delete workspace
    const isOwner = await workspaceService.checkUserPermission(
      workspaceId,
      userId,
      ["OWNER"]
    );

    if (!isOwner) {
      throw new ApiError(
        "Only workspace owner can delete workspace",
        HttpStatus.FORBIDDEN
      );
    }

    await workspaceService.deleteWorkspace(workspaceId);

    res.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  },

  async inviteToWorkspace(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user!.id;
    const { email, permission } = req.body;

    // Check if user has permission to invite
    const hasPermission = await workspaceService.checkUserPermission(
      workspaceId,
      userId,
      ["OWNER", "ADMIN"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const invite = await workspaceService.inviteToWorkspace({
      workspaceId,
      email,
      permission,
      invitedBy: userId,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: invite,
    });
  },

  async acceptInvite(req: Request, res: Response) {
    const { inviteId } = req.params;
    const userEmail = req.user!.email;

    const workspace = await workspaceService.acceptInvite(inviteId, userEmail);

    res.json({
      success: true,
      data: workspace,
    });
  },

  async getWorkspaceMembers(req: Request, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user!.id;

    // Check if user has access to this workspace
    const hasAccess = await workspaceService.checkUserAccess(
      workspaceId,
      userId
    );
    if (!hasAccess) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    const members = await workspaceService.getWorkspaceMembers(workspaceId);

    res.json({
      success: true,
      data: members,
    });
  },

  async removeWorkspaceMember(req: Request, res: Response) {
    const { workspaceId, memberId } = req.params;
    const userId = req.user!.id;

    // Check if user has permission to remove members
    const hasPermission = await workspaceService.checkUserPermission(
      workspaceId,
      userId,
      ["OWNER", "ADMIN"]
    );

    if (!hasPermission) {
      throw new ApiError("Access denied", HttpStatus.FORBIDDEN);
    }

    await workspaceService.removeWorkspaceMember(workspaceId, memberId);

    res.json({
      success: true,
      message: "Member removed successfully",
    });
  },

  async updateMemberPermission(req: Request, res: Response) {
    const { workspaceId, memberId } = req.params;
    const userId = req.user!.id;
    const { permission } = req.body;

    // Only owner can change permissions
    const isOwner = await workspaceService.checkUserPermission(
      workspaceId,
      userId,
      ["OWNER"]
    );

    if (!isOwner) {
      throw new ApiError(
        "Only workspace owner can change permissions",
        HttpStatus.FORBIDDEN
      );
    }

    const member = await workspaceService.updateMemberPermission(
      workspaceId,
      memberId,
      permission
    );

    res.json({
      success: true,
      data: member,
    });
  },
};
