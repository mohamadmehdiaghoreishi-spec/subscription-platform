import { describe, it, expect } from "vitest";

import {
  asRecord,
  requireString,
  optionalString,
  requireOneOf,
  optionalOneOf,
} from "../../../src/core/validation/ValidationRules";

describe("ValidationRules", () => {

  describe("asRecord", () => {

    it("accepts a plain object", () => {
      expect(asRecord({ a: 1 }, "ctx")).toEqual({ a: 1 });
    });

    it("rejects null", () => {
      expect(() => asRecord(null, "ctx")).toThrow(/must be a JSON object/);
    });

    it("rejects arrays", () => {
      expect(() => asRecord([1, 2], "ctx")).toThrow(/must be a JSON object/);
    });

    it("rejects primitives", () => {
      expect(() => asRecord("hello", "ctx")).toThrow(/must be a JSON object/);
    });

  });

  describe("requireString", () => {

    it("returns the value when present and non-empty", () => {
      expect(requireString({ name: "hi" }, "name")).toBe("hi");
    });

    it("throws when missing", () => {
      expect(() => requireString({}, "name")).toThrow(/name is required/);
    });

    it("throws when empty or whitespace-only", () => {
      expect(() => requireString({ name: "   " }, "name")).toThrow(/name is required/);
    });

    it("throws when not a string", () => {
      expect(() => requireString({ name: 123 }, "name")).toThrow(/name is required/);
    });

  });

  describe("optionalString", () => {

    it("returns undefined when absent", () => {
      expect(optionalString({}, "name")).toBeUndefined();
    });

    it("returns undefined when null", () => {
      expect(optionalString({ name: null }, "name")).toBeUndefined();
    });

    it("returns the value when present", () => {
      expect(optionalString({ name: "hi" }, "name")).toBe("hi");
    });

    it("throws when present but empty", () => {
      expect(() => optionalString({ name: "" }, "name")).toThrow(/must be a non-empty string/);
    });

  });

  describe("requireOneOf", () => {

    const allowed = ["A", "B"] as const;

    it("returns the value when it's in the allowed list", () => {
      expect(requireOneOf({ plan: "A" }, "plan", allowed)).toBe("A");
    });

    it("throws when missing", () => {
      expect(() => requireOneOf({}, "plan", allowed)).toThrow(/must be one of: A, B/);
    });

    it("throws when not in the allowed list", () => {
      expect(() => requireOneOf({ plan: "C" }, "plan", allowed)).toThrow(/must be one of: A, B/);
    });

  });

  describe("optionalOneOf", () => {

    const allowed = ["A", "B"] as const;

    it("returns undefined when absent", () => {
      expect(optionalOneOf({}, "plan", allowed)).toBeUndefined();
    });

    it("returns the value when valid", () => {
      expect(optionalOneOf({ plan: "B" }, "plan", allowed)).toBe("B");
    });

    it("throws when present but invalid", () => {
      expect(() => optionalOneOf({ plan: "Z" }, "plan", allowed)).toThrow(/must be one of: A, B/);
    });

  });

});
