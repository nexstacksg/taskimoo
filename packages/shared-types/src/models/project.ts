import { ProjectStatus, ProjectPriority } from '../enums';

export interface IProject {
  id: string;
  name: string;
  key: string; // e.g., "TASK", "DEV"
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: Date | null;
  endDate?: Date | null;
  workspaceId: string;
  spaceId?: string | null;
  folderId?: string | null;
  leadId?: string | null;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectPublic {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ICreateProject {
  name: string;
  key: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  workspaceId: string;
  spaceId?: string;
  folderId?: string;
  leadId?: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  leadId?: string;
  settings?: Record<string, any>;
}