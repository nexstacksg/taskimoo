import { Router } from "express";
import { taskController } from "../../../controllers/task/taskController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import {
  createTaskSchema,
  updateTaskSchema,
  addCommentSchema,
  addChecklistSchema,
  updateChecklistItemSchema,
  trackTimeSchema,
  addDependencySchema,
  bulkUpdateTasksSchema,
  reorderTasksSchema,
  taskParamsSchema,
  checklistParamsSchema,
  taskQuerySchema,
} from "../../../middleware/validation/schemas/taskSchemas";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Task CRUD
router.post(
  "/",
  validateRequest(createTaskSchema),
  asyncHandler(taskController.createTask)
);

router.get(
  "/",
  validateRequest(taskQuerySchema),
  asyncHandler(taskController.getTasks)
);

router.get(
  "/:taskId",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.getTask)
);

router.put(
  "/:taskId",
  validateRequest({ ...taskParamsSchema.shape, ...updateTaskSchema.shape }),
  asyncHandler(taskController.updateTask)
);

router.delete(
  "/:taskId",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.deleteTask)
);

// Task Comments
router.post(
  "/:taskId/comments",
  validateRequest({ ...taskParamsSchema.shape, ...addCommentSchema.shape }),
  asyncHandler(taskController.addComment)
);

router.get(
  "/:taskId/comments",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.getComments)
);

// Task Checklists
router.post(
  "/:taskId/checklists",
  validateRequest({ ...taskParamsSchema.shape, ...addChecklistSchema.shape }),
  asyncHandler(taskController.addChecklist)
);

router.put(
  "/:taskId/checklists/:checklistId/items/:itemId",
  validateRequest({ ...checklistParamsSchema.shape, ...updateChecklistItemSchema.shape }),
  asyncHandler(taskController.updateChecklistItem)
);

// Time Tracking
router.post(
  "/:taskId/time-tracking",
  validateRequest({ ...taskParamsSchema.shape, ...trackTimeSchema.shape }),
  asyncHandler(taskController.trackTime)
);

router.get(
  "/:taskId/time-tracking",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.getTimeTracking)
);

// Bulk Operations
router.put(
  "/bulk-update",
  validateRequest(bulkUpdateTasksSchema),
  asyncHandler(taskController.bulkUpdateTasks)
);

// Task Dependencies
router.post(
  "/:taskId/dependencies",
  validateRequest({ ...taskParamsSchema.shape, ...addDependencySchema.shape }),
  asyncHandler(taskController.addDependency)
);

router.delete(
  "/:taskId/dependencies/:dependencyId",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.removeDependency)
);

router.get(
  "/:taskId/dependencies",
  validateRequest(taskParamsSchema),
  asyncHandler(taskController.getDependencies)
);

// Task Reordering
router.put(
  "/reorder",
  validateRequest(reorderTasksSchema),
  asyncHandler(taskController.reorderTasks)
);

export default router;