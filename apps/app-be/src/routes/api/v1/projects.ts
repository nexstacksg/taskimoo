import { Router } from "express";
import { projectController } from "../../../controllers/project/projectController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import {
  createProjectSchema,
  updateProjectSchema,
  createListSchema,
  updateListSchema,
  // createSpaceSchema,
  // createFolderSchema,
  projectParamsSchema,
  listParamsSchema,
  projectQuerySchema,
} from "../../../middleware/validation/schemas/projectSchemas";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Project CRUD
router.post(
  "/",
  validateRequest(createProjectSchema),
  asyncHandler(projectController.createProject)
);

router.get(
  "/",
  validateRequest(projectQuerySchema),
  asyncHandler(projectController.getProjects)
);

router.get(
  "/:projectId",
  validateRequest(projectParamsSchema),
  asyncHandler(projectController.getProject)
);

router.put(
  "/:projectId",
  validateRequest({
    ...projectParamsSchema.shape,
    ...updateProjectSchema.shape,
  }),
  asyncHandler(projectController.updateProject)
);

router.delete(
  "/:projectId",
  validateRequest(projectParamsSchema),
  asyncHandler(projectController.deleteProject)
);

// Project Lists
router.post(
  "/:projectId/lists",
  validateRequest({ ...projectParamsSchema.shape, ...createListSchema.shape }),
  asyncHandler(projectController.createList)
);

router.get(
  "/:projectId/lists",
  validateRequest(projectParamsSchema),
  asyncHandler(projectController.getLists)
);

router.put(
  "/:projectId/lists/:listId",
  validateRequest({ ...listParamsSchema.shape, ...updateListSchema.shape }),
  asyncHandler(projectController.updateList)
);

router.delete(
  "/:projectId/lists/:listId",
  validateRequest(listParamsSchema),
  asyncHandler(projectController.deleteList)
);

export default router;
