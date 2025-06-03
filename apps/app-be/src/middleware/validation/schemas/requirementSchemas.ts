import { z } from "zod";

export const createRequirementSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(10000, "Description must be less than 10000 characters"),
    type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "TECHNICAL", "BUSINESS_RULE", "CONSTRAINT"]),
    priority: z.enum(["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE", "WONT_HAVE"]),
    projectId: z.string().cuid("Invalid project ID"),
    acceptanceCriteria: z.array(z.string().min(1, "Acceptance criteria cannot be empty").max(500, "Acceptance criteria must be less than 500 characters")).optional(),
    dependencies: z.array(z.string().cuid("Invalid requirement ID")).optional(),
    tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
  }),
});

export const updateRequirementSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").max(10000, "Description must be less than 10000 characters").optional(),
    type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "TECHNICAL", "BUSINESS_RULE", "CONSTRAINT"]).optional(),
    status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "IMPLEMENTED", "REJECTED", "DEPRECATED"]).optional(),
    priority: z.enum(["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE", "WONT_HAVE"]).optional(),
    acceptanceCriteria: z.array(z.string().min(1, "Acceptance criteria cannot be empty").max(500, "Acceptance criteria must be less than 500 characters")).optional(),
    dependencies: z.array(z.string().cuid("Invalid requirement ID")).optional(),
    tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
  }),
});

export const linkRequirementToTaskSchema = z.object({
  body: z.object({
    taskId: z.string().cuid("Invalid task ID"),
  }),
});

export const requirementParamsSchema = z.object({
  params: z.object({
    requirementId: z.string().cuid("Invalid requirement ID"),
  }),
});

export const requirementQuerySchema = z.object({
  query: z.object({
    projectId: z.string().cuid("Invalid project ID"),
    type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "TECHNICAL", "BUSINESS_RULE", "CONSTRAINT"]).optional(),
    status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "IMPLEMENTED", "REJECTED", "DEPRECATED"]).optional(),
    priority: z.enum(["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE", "WONT_HAVE"]).optional(),
    search: z.string().max(100, "Search term must be less than 100 characters").optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});