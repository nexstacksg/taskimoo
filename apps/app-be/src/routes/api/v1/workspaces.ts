import { Router } from "express";
import { workspaceController } from "../../../controllers/workspace/workspaceController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteToWorkspaceSchema,
  updateMemberPermissionSchema,
  workspaceParamsSchema,
  memberParamsSchema,
  inviteParamsSchema,
} from "../../../middleware/validation/schemas/workspaceSchemas";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

// All workspace routes require authentication
router.use(authenticate);

// Workspace CRUD
router.post(
  "/",
  validateRequest(createWorkspaceSchema),
  asyncHandler(workspaceController.createWorkspace)
);

router.get("/", asyncHandler(workspaceController.getWorkspaces));

router.get(
  "/:workspaceId",
  validateRequest(workspaceParamsSchema),
  asyncHandler(workspaceController.getWorkspace)
);

router.put(
  "/:workspaceId",
  validateRequest({ ...workspaceParamsSchema.shape, ...updateWorkspaceSchema.shape }),
  asyncHandler(workspaceController.updateWorkspace)
);

router.delete(
  "/:workspaceId",
  validateRequest(workspaceParamsSchema),
  asyncHandler(workspaceController.deleteWorkspace)
);

// Workspace invitations
router.post(
  "/:workspaceId/invites",
  validateRequest({ ...workspaceParamsSchema.shape, ...inviteToWorkspaceSchema.shape }),
  asyncHandler(workspaceController.inviteToWorkspace)
);

router.post(
  "/invites/:inviteId/accept",
  validateRequest(inviteParamsSchema),
  asyncHandler(workspaceController.acceptInvite)
);

// Workspace members
router.get(
  "/:workspaceId/members",
  validateRequest(workspaceParamsSchema),
  asyncHandler(workspaceController.getWorkspaceMembers)
);

router.delete(
  "/:workspaceId/members/:memberId",
  validateRequest(memberParamsSchema),
  asyncHandler(workspaceController.removeWorkspaceMember)
);

router.put(
  "/:workspaceId/members/:memberId/permission",
  validateRequest({ ...memberParamsSchema.shape, ...updateMemberPermissionSchema.shape }),
  asyncHandler(workspaceController.updateMemberPermission)
);

export default router;