import { Router } from "express";
import { requirementController } from "../../../controllers/requirement/requirementController";
import { authenticate } from "../../../middleware/auth/authenticate";
import { validateRequest } from "../../../middleware/validation/validationMiddleware";
import {
  createRequirementSchema,
  updateRequirementSchema,
  linkRequirementToTaskSchema,
  requirementParamsSchema,
  requirementQuerySchema,
} from "../../../middleware/validation/schemas/requirementSchemas";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

// All requirement routes require authentication
router.use(authenticate);

// Requirement CRUD
router.post(
  "/",
  validateRequest(createRequirementSchema),
  asyncHandler(requirementController.createRequirement)
);

router.get(
  "/",
  validateRequest(requirementQuerySchema),
  asyncHandler(requirementController.getRequirements)
);

router.get(
  "/:requirementId",
  validateRequest(requirementParamsSchema),
  asyncHandler(requirementController.getRequirement)
);

router.put(
  "/:requirementId",
  validateRequest({ ...requirementParamsSchema.shape, ...updateRequirementSchema.shape }),
  asyncHandler(requirementController.updateRequirement)
);

router.delete(
  "/:requirementId",
  validateRequest(requirementParamsSchema),
  asyncHandler(requirementController.deleteRequirement)
);

// AI-powered features
router.post(
  "/:requirementId/analyze",
  validateRequest(requirementParamsSchema),
  asyncHandler(requirementController.analyzeRequirement)
);

router.post(
  "/:requirementId/generate-test-cases",
  validateRequest(requirementParamsSchema),
  asyncHandler(requirementController.generateTestCases)
);

// Requirement history
router.get(
  "/:requirementId/history",
  validateRequest(requirementParamsSchema),
  asyncHandler(requirementController.getRequirementHistory)
);

// Task linking
router.post(
  "/:requirementId/link-task",
  validateRequest({ ...requirementParamsSchema.shape, ...linkRequirementToTaskSchema.shape }),
  asyncHandler(requirementController.linkRequirementToTask)
);

export default router;