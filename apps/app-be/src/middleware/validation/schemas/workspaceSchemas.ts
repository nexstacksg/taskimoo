import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    slug: z.string().optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    settings: z.record(z.any()).optional(),
  }),
});

export const inviteToWorkspaceSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    permission: z.enum(["ADMIN", "WRITE", "READ"], {
      errorMap: () => ({ message: "Permission must be ADMIN, WRITE, or READ" }),
    }),
  }),
});

export const updateMemberPermissionSchema = z.object({
  body: z.object({
    permission: z.enum(["OWNER", "ADMIN", "WRITE", "READ"], {
      errorMap: () => ({ message: "Permission must be OWNER, ADMIN, WRITE, or read" }),
    }),
  }),
});

export const workspaceParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid("Invalid workspace ID"),
  }),
});

export const memberParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid("Invalid workspace ID"),
    memberId: z.string().cuid("Invalid member ID"),
  }),
});

export const inviteParamsSchema = z.object({
  params: z.object({
    inviteId: z.string().cuid("Invalid invite ID"),
  }),
});