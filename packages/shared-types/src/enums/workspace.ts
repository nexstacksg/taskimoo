export const WorkspaceStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  TRIAL: "TRIAL",
} as const;

export const WorkspacePlan = {
  FREE: "FREE",
  STARTER: "STARTER",
  PROFESSIONAL: "PROFESSIONAL",
  ENTERPRISE: "ENTERPRISE",
} as const;

export const MemberPermission = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  WRITE: "WRITE",
  READ: "READ",
} as const;

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
} as const;

export type WorkspaceStatus = (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];
export type WorkspacePlan = (typeof WorkspacePlan)[keyof typeof WorkspacePlan];
export type MemberPermission = (typeof MemberPermission)[keyof typeof MemberPermission];
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];