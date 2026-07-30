import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// QA account seeded fully unlocked: all morse_character_mastery/user_progress
// at 100%. Credentials are read from env vars only -- see
// apps/web/.env.e2e.example.
const QA_EMAIL = process.env.CAPPY_QA_EMAIL ?? "";
const QA_PASSWORD = process.env.CAPPY_QA_PASSWORD ?? "";

test.beforeAll(() => {
  if (!QA_EMAIL || !QA_PASSWORD) {
    throw new Error("CAPPY_QA_EMAIL / CAPPY_QA_PASSWORD must be set (see apps/web/.env.e2e.example)");
  }
});

test("morse level list renders real unit/lesson tiles", async ({ page }) => {
  await login(page, QA_EMAIL, QA_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/morse/levels");
  await expect(page.getByRole("heading", { name: "Morse Levels" })).toBeVisible();

  const unitHeadings = page.getByRole("heading", { level: 2 });
  await expect(unitHeadings.first()).toBeVisible();
  expect(await unitHeadings.count()).toBeGreaterThan(0);

  const lessonTiles = page.getByRole("button");
  expect(await lessonTiles.count()).toBeGreaterThan(0);
});
