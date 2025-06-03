import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().max(5000, "Description must be less than 5000 characters").optional(),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).optional(),
    priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional(),
    type: z.enum(["FEATURE", "BUG", "TASK", "STORY", "EPIC", "SUBTASK", "DOCUMENTATION", "RESEARCH"]),
    projectId: z.string().cuid("Invalid project ID"),
    listId: z.string().cuid("Invalid list ID").optional(),
    parentId: z.string().cuid("Invalid parent ID").optional(),
    assigneeId: z.string().cuid("Invalid assignee ID").optional(),
    dueDate: z.string().datetime().optional(),
    startDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive("Estimated hours must be positive").optional(),
    storyPoints: z.number().int().min(1).max(100, "Story points must be between 1 and 100").optional(),
    tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
    description: z.string().max(5000, "Description must be less than 5000 characters").optional(),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).optional(),
    priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional(),
    type: z.enum(["FEATURE", "BUG", "TASK", "STORY", "EPIC", "SUBTASK", "DOCUMENTATION", "RESEARCH"]).optional(),
    listId: z.string().cuid("Invalid list ID").optional(),
    assigneeId: z.string().cuid("Invalid assignee ID").optional(),
    dueDate: z.string().datetime().optional(),
    startDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive("Estimated hours must be positive").optional(),
    actualHours: z.number().positive("Actual hours must be positive").optional(),
    storyPoints: z.number().int().min(1).max(100, "Story points must be between 1 and 100").optional(),
    tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
    customFields: z.record(z.any()).optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
    parentId: z.string().cuid("Invalid parent ID").optional(),
    mentions: z.array(z.string().cuid("Invalid user ID")).optional(),
  }),
});

export const addChecklistSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    items: z.array(z.string().min(1, "Item cannot be empty").max(200, "Item must be less than 200 characters"))
      .min(1, "At least one item is required"),
  }),
});

export const updateChecklistItemSchema = z.object({
  body: z.object({
    isCompleted: z.boolean(),
  }),
});

export const trackTimeSchema = z.object({
  body: z.object({
    startTime: z.string().datetime("Invalid start time"),
    endTime: z.string().datetime("Invalid end time").optional(),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
  }),
});

export const addDependencySchema = z.object({
  body: z.object({
    dependsOnId: z.string().cuid("Invalid task ID"),
    type: z.enum(["FINISH_TO_START", "START_TO_START", "FINISH_TO_FINISH", "START_TO_FINISH"]).optional(),
  }),
});

export const bulkUpdateTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().cuid("Invalid task ID")).min(1, "At least one task ID is required"),
    updates: z.object({
      status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).optional(),
      priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional(),
      assigneeId: z.string().cuid("Invalid assignee ID").optional(),
      listId: z.string().cuid("Invalid list ID").optional(),
      tags: z.array(z.string().max(50, "Tag must be less than 50 characters")).optional(),
    }),
  }),
});

export const reorderTasksSchema = z.object({
  body: z.object({
    taskIds: z.array(z.string().cuid("Invalid task ID")).min(1, "At least one task ID is required"),
  }),
});

export const taskParamsSchema = z.object({
  params: z.object({
    taskId: z.string().cuid("Invalid task ID"),
  }),
});

export const checklistParamsSchema = z.object({
  params: z.object({
    taskId: z.string().cuid("Invalid task ID"),
    checklistId: z.string().cuid("Invalid checklist ID"),
    itemId: z.string().cuid("Invalid item ID"),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    projectId: z.string().cuid("Invalid project ID"),
    listId: z.string().cuid("Invalid list ID").optional(),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "TESTING", "DONE", "CANCELLED"]).optional(),
    priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional(),
    type: z.enum(["FEATURE", "BUG", "TASK", "STORY", "EPIC", "SUBTASK", "DOCUMENTATION", "RESEARCH"]).optional(),
    assigneeId: z.string().cuid("Invalid assignee ID").optional(),
    parentId: z.string().optional(), // Can be "null" string
    search: z.string().max(100, "Search term must be less than 100 characters").optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});