export const RequirementType = {
  FUNCTIONAL: "FUNCTIONAL",
  NON_FUNCTIONAL: "NON_FUNCTIONAL",
  TECHNICAL: "TECHNICAL",
  BUSINESS_RULE: "BUSINESS_RULE",
  CONSTRAINT: "CONSTRAINT",
} as const;

export const RequirementStatus = {
  DRAFT: "DRAFT",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  IMPLEMENTED: "IMPLEMENTED",
  REJECTED: "REJECTED",
  DEPRECATED: "DEPRECATED",
} as const;

export const RequirementPriority = {
  MUST_HAVE: "MUST_HAVE",
  SHOULD_HAVE: "SHOULD_HAVE",
  COULD_HAVE: "COULD_HAVE",
  WONT_HAVE: "WONT_HAVE",
} as const;

export type RequirementType = (typeof RequirementType)[keyof typeof RequirementType];
export type RequirementStatus = (typeof RequirementStatus)[keyof typeof RequirementStatus];
export type RequirementPriority = (typeof RequirementPriority)[keyof typeof RequirementPriority];