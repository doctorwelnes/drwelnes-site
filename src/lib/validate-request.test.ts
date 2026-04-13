import { describe, it, expect } from "vitest";
import { validateRequest } from "./validate-request";
import { z } from "zod";

const testSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

describe("validateRequest", () => {
  it("should return success for valid data", () => {
    const result = validateRequest(testSchema, {
      name: "John",
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "John",
        email: "john@example.com",
      });
    }
  });

  it("should return error for invalid data", () => {
    const result = validateRequest(testSchema, {
      name: "",
      email: "invalid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("should return error for missing fields", () => {
    const result = validateRequest(testSchema, {
      name: "John",
    });

    expect(result.success).toBe(false);
  });

  it("should return error for extra fields (strip by default)", () => {
    const result = validateRequest(testSchema, {
      name: "John",
      email: "john@example.com",
      extra: "field",
    });

    // Zod strips extra fields by default, so this should succeed
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("extra");
    }
  });
});
