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

// Prices in Toman — adjust to your real pricing before going live.
export const PlanPrices = {
  FREE: 0,
  BASIC: 100000,
  PRO: 300000,
  ENTERPRISE: 1000000,
} as const;