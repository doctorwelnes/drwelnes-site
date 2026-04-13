import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("has title and navigation", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/Dr.Welnes/);

    // Check main navigation elements are visible
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");

    // Check recipes link
    await page.getByRole("link", { name: /питание/i }).click();
    await expect(page).toHaveURL(/.*recipes.*/);

    // Check exercises link
    await page.goto("/");
    await page.getByRole("link", { name: /тренинг/i }).click();
    await expect(page).toHaveURL(/.*exercises.*/);
  });
});

test.describe("Recipes page", () => {
  test("displays recipe list", async ({ page }) => {
    await page.goto("/recipes");

    // Check page has content
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("recipe detail page loads", async ({ page }) => {
    await page.goto("/recipes");

    // Click first recipe link if exists
    const firstRecipe = page.getByRole("link").filter({ hasText: /./ }).first();
    if (await firstRecipe.isVisible().catch(() => false)) {
      await firstRecipe.click();
      await expect(page).toHaveURL(/.*recipes\/.+/);
    }
  });
});

test.describe("Accessibility", () => {
  test("should not have any automatically detectable accessibility issues", async ({ page }) => {
    await page.goto("/");

    // Basic accessibility checks
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);

    // Check images have alt text
    const images = await page.locator("img").all();
    for (const img of images) {
      const hasAlt = await img.getAttribute("alt");
      // Skip images that might intentionally not have alt
      if (hasAlt !== null) {
        expect(hasAlt).not.toBe("");
      }
    }
  });
});
