import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    key: z.string()
      .min(2, "Key must be at least 2 characters")
      .max(10, "Key must be less than 10 characters")
      .regex(/^[A-Z0-9]+$/, "Key must contain only uppercase letters and numbers"),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    workspaceId: z.string().cuid("Invalid workspace ID"),
    spaceId: z.string().cuid("Invalid space ID").optional(),
    folderId: z.string().cuid("Invalid folder ID").optional(),
    leadId: z.string().cuid("Invalid lead ID").optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    leadId: z.string().cuid("Invalid lead ID").optional(),
    settings: z.record(z.any()).optional(),
  }),
});

export const createListSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
  }),
});

export const updateListSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const createSpaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
    icon: z.string().max(50, "Icon must be less than 50 characters").optional(),
    workspaceId: z.string().cuid("Invalid workspace ID"),
  }),
});

export const createFolderSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color").optional(),
    spaceId: z.string().cuid("Invalid space ID"),
    parentId: z.string().cuid("Invalid parent ID").optional(),
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    projectId: z.string().cuid("Invalid project ID"),
  }),
});

export const listParamsSchema = z.object({
  params: z.object({
    projectId: z.string().cuid("Invalid project ID"),
    listId: z.string().cuid("Invalid list ID"),
  }),
});

export const projectQuerySchema = z.object({
  query: z.object({
    workspaceId: z.string().cuid("Invalid workspace ID"),
    spaceId: z.string().cuid("Invalid space ID").optional(),
    folderId: z.string().cuid("Invalid folder ID").optional(),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});