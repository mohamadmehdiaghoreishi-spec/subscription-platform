import { PlanType } from "../plans/PlanTypes";
import {
  asRecord,
  requireString,
  requireOneOf,
  optionalOneOf
} from "./ValidationRules";


const PLAN_VALUES = Object.values(PlanType) as PlanType[];


export interface CreateKeyBody {
  subscriptionId: string;
}

export function validateCreateKeyBody(raw: unknown): CreateKeyBody {

  const body = asRecord(raw, "auth/create-key");

  return {
    subscriptionId: requireString(body, "subscriptionId")
  };

}


export interface RevokeKeyBody {
  key: string;
}

export function validateRevokeKeyBody(raw: unknown): RevokeKeyBody {

  const body = asRecord(raw, "auth/revoke-key");

  return {
    key: requireString(body, "key")
  };

}


export interface CheckoutBody {
  plan: PlanType;
  subscriptionId: string;
}

export function validateCheckoutBody(raw: unknown): CheckoutBody {

  const body = asRecord(raw, "billing/checkout");

  return {
    plan: requireOneOf(body, "plan", PLAN_VALUES),
    subscriptionId: requireString(body, "subscriptionId")
  };

}


export interface SubscribeBody {
  plan?: PlanType;
  [key: string]: unknown;
}

export function validateSubscribeBody(raw: unknown): SubscribeBody {

  const body = asRecord(raw, "subscribe");

  const plan = optionalOneOf(body, "plan", PLAN_VALUES);

  return {
    ...body,
    ...(plan !== undefined ? { plan } : {})
  };

}
