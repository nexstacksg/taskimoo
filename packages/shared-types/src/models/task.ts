import { TaskStatus, TaskPriority, TaskType } from '../enums';

export interface ITask {
  id: string;
  number: number; // Auto-incremented task number within project
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  projectId: string;
  listId?: string | null;
  parentId?: string | null; // For subtasks
  assigneeId?: string | null;
  reporterId: string;
  dueDate?: Date | null;
  startDate?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  storyPoints?: number | null;
  tags?: string[];
  customFields?: Record<string, any>;
  position: number; // For ordering in lists
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskPublic {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate: Date | null;
  startDate: Date | null;
  estimatedHours: number | null;
  storyPoints: number | null;
  tags: string[];
}

export interface ICreateTask {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type: TaskType;
  projectId: string;
  listId?: string;
  parentId?: string;
  assigneeId?: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  storyPoints?: number;
  tags?: string[];
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  listId?: string;
  assigneeId?: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  tags?: string[];
  customFields?: Record<string, any>;
  position?: number;
}