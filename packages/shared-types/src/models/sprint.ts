import { SprintStatus } from '../enums';

export interface ISprint {
  id: string;
  name: string;
  goal?: string | null;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISprintPublic {
  id: string;
  name: string;
  goal: string | null;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
}

export interface ICreateSprint {
  name: string;
  goal?: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
}

export interface IUpdateSprint {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: SprintStatus;
}