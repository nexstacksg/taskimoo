export const TaskStatus = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  TESTING: "TESTING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const TaskPriority = {
  URGENT: "URGENT",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;

export const TaskType = {
  FEATURE: "FEATURE",
  BUG: "BUG",
  TASK: "TASK",
  STORY: "STORY",
  EPIC: "EPIC",
  SUBTASK: "SUBTASK",
  DOCUMENTATION: "DOCUMENTATION",
  RESEARCH: "RESEARCH",
} as const;

export const TaskDependencyType = {
  FINISH_TO_START: "FINISH_TO_START",
  START_TO_START: "START_TO_START",
  FINISH_TO_FINISH: "FINISH_TO_FINISH",
  START_TO_FINISH: "START_TO_FINISH",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export type TaskType = (typeof TaskType)[keyof typeof TaskType];
export type TaskDependencyType = (typeof TaskDependencyType)[keyof typeof TaskDependencyType];