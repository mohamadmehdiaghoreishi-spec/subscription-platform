export enum PlanType {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export const PlanLimits = {
  FREE: { requestsPerDay: 100 },
  BASIC: { requestsPerDay: 1000 },
  PRO: { requestsPerDay: 10000 },
  ENTERPRISE: { requestsPerDay: Infinity },
} as const;