import { describe, it, expect } from "vitest";

import {
  validateCreateKeyBody,
  validateRevokeKeyBody,
  validateCheckoutBody,
  validateSubscribeBody,
} from "../../../src/core/validation/RequestSchemas";
import { PlanType } from "../../../src/core/plans/PlanTypes";

describe("RequestSchemas", () => {

  describe("validateCreateKeyBody", () => {

    it("accepts a body with subscriptionId", () => {
      expect(validateCreateKeyBody({ subscriptionId: "owner-1" }))
        .toEqual({ subscriptionId: "owner-1" });
    });

    it("rejects a body missing subscriptionId", () => {
      expect(() => validateCreateKeyBody({})).toThrow();
    });

    it("rejects a non-object body", () => {
      expect(() => validateCreateKeyBody("nope")).toThrow();
    });

  });

  describe("validateRevokeKeyBody", () => {

    it("accepts a body with key", () => {
      expect(validateRevokeKeyBody({ key: "abc" })).toEqual({ key: "abc" });
    });

    it("rejects a body missing key", () => {
      expect(() => validateRevokeKeyBody({})).toThrow();
    });

  });

  describe("validateCheckoutBody", () => {

    it("accepts a valid plan and subscriptionId", () => {
      expect(validateCheckoutBody({ plan: "PRO", subscriptionId: "owner-1" }))
        .toEqual({ plan: "PRO", subscriptionId: "owner-1" });
    });

    it("rejects an unknown plan", () => {
      expect(() => validateCheckoutBody({ plan: "NOT_A_PLAN", subscriptionId: "owner-1" }))
        .toThrow();
    });

    it("rejects a missing plan", () => {
      expect(() => validateCheckoutBody({ subscriptionId: "owner-1" })).toThrow();
    });

    it("rejects a missing subscriptionId", () => {
      expect(() => validateCheckoutBody({ plan: "PRO" })).toThrow();
    });

  });

  describe("validateSubscribeBody", () => {

    it("passes an empty body through with no plan", () => {
      expect(validateSubscribeBody({})).toEqual({});
    });

    it("keeps a valid plan", () => {
      expect(validateSubscribeBody({ plan: "PRO" })).toEqual({ plan: "PRO" });
    });

    it("rejects an invalid plan", () => {
      expect(() => validateSubscribeBody({ plan: "NOT_A_PLAN" })).toThrow();
    });

    it("passes through unrelated extra fields untouched", () => {
      expect(validateSubscribeBody({ note: "hello" })).toEqual({ note: "hello" });
    });

  });

});
