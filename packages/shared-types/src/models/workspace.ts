import { WorkspaceStatus, WorkspacePlan } from '../enums';

export interface IWorkspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  status: WorkspaceStatus;
  plan: WorkspacePlan;
  ownerId: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspacePublic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  plan: WorkspacePlan;
}

export interface ICreateWorkspace {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
}

export interface IUpdateWorkspace {
  name?: string;
  description?: string;
  logo?: string;
  settings?: Record<string, any>;
}