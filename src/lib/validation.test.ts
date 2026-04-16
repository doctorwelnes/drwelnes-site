import { describe, it, expect } from "vitest";
import {
  updateProfileSchema,
  updatePasswordSchema,
  saveCalculationSchema,
  addRecipeFavoriteSchema,
  addExerciseFavoriteSchema,
  adminFileSchema,
  adminDuplicateSchema,
  adminSearchSchema,
} from "./validation";

describe("Validation Schemas", () => {
  describe("updateProfileSchema", () => {
    it("should validate valid profile data", () => {
      const result = updateProfileSchema.safeParse({
        name: "John Doe",
        phone: "+1234567890",
        telegram: "@john",
      });
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const result = updateProfileSchema.safeParse({
        name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name longer than 100 chars", () => {
      const result = updateProfileSchema.safeParse({
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("should validate valid password change", () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: "oldpass123",
        newPassword: "newpass456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short new password", () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: "oldpass123",
        newPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty current password", () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "newpass456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("saveCalculationSchema", () => {
    it("should validate valid calculation data", () => {
      const result = saveCalculationSchema.safeParse({
        type: "BMI",
        name: "My BMI Calculation",
        result: { bmi: 22.5, category: "Normal" },
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid calculator type", () => {
      const result = saveCalculationSchema.safeParse({
        type: "INVALID_TYPE",
        name: "Test",
        result: {},
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const result = saveCalculationSchema.safeParse({
        type: "BMI",
        name: "",
        result: {},
      });
      expect(result.success).toBe(false);
    });

    it("should accept all valid calculator types", () => {
      const validTypes = ["BMI", "BMR", "TDEE", "CALORIES", "BODYFAT", "IDEALWEIGHT", "WATERTEST"];
      validTypes.forEach((type) => {
        const result = saveCalculationSchema.safeParse({
          type,
          name: "Test Calculation",
          result: {},
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("addRecipeFavoriteSchema", () => {
    it("should validate valid recipe ID", () => {
      const result = addRecipeFavoriteSchema.safeParse({
        recipeId: "recipe-123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty recipe ID", () => {
      const result = addRecipeFavoriteSchema.safeParse({
        recipeId: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing recipe ID", () => {
      const result = addRecipeFavoriteSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("addExerciseFavoriteSchema", () => {
    it("should validate valid exercise ID", () => {
      const result = addExerciseFavoriteSchema.safeParse({
        exerciseId: "exercise-456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty exercise ID", () => {
      const result = addExerciseFavoriteSchema.safeParse({
        exerciseId: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("adminFileSchema", () => {
    it("should validate valid file data", () => {
      const result = adminFileSchema.safeParse({
        path: "recipes/test-recipe.md",
        frontmatter: { title: "Test" },
        content: "# Test Content",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with only path", () => {
      const result = adminFileSchema.safeParse({
        path: "recipes/test.md",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty path", () => {
      const result = adminFileSchema.safeParse({
        path: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("adminDuplicateSchema", () => {
    it("should validate valid path", () => {
      const result = adminDuplicateSchema.safeParse({
        path: "recipes/original.md",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty path", () => {
      const result = adminDuplicateSchema.safeParse({
        path: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("adminSearchSchema", () => {
    it("should validate valid search query", () => {
      const result = adminSearchSchema.safeParse({
        query: "test search",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty query", () => {
      const result = adminSearchSchema.safeParse({
        query: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject query longer than 200 chars", () => {
      const result = adminSearchSchema.safeParse({
        query: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });
});
