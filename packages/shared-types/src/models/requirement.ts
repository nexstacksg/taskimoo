import { RequirementType, RequirementStatus, RequirementPriority } from '../enums';

export interface IRequirement {
  id: string;
  code: string; // e.g., "FR-001", "NFR-001"
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  projectId: string;
  authorId: string;
  version: number;
  qualityScore?: number | null; // AI-generated quality score 0-100
  acceptanceCriteria?: string[];
  dependencies?: string[]; // IDs of other requirements
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequirementPublic {
  id: string;
  code: string;
  title: string;
  description: string;
  type: RequirementType;
  status: RequirementStatus;
  priority: RequirementPriority;
  version: number;
  qualityScore: number | null;
  acceptanceCriteria: string[];
  tags: string[];
}

export interface ICreateRequirement {
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  projectId: string;
  acceptanceCriteria?: string[];
  dependencies?: string[];
  tags?: string[];
}

export interface IUpdateRequirement {
  title?: string;
  description?: string;
  type?: RequirementType;
  status?: RequirementStatus;
  priority?: RequirementPriority;
  acceptanceCriteria?: string[];
  dependencies?: string[];
  tags?: string[];
}