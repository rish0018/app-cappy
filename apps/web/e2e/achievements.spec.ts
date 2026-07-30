import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// QA account seeded fully unlocked: all achievements/mastery at 100%, streak
// maxed. Credentials are read from env vars only -- see
// apps/web/.env.e2e.example.
const QA_EMAIL = process.env.CAPPY_QA_EMAIL ?? "";
const QA_PASSWORD = process.env.CAPPY_QA_PASSWORD ?? "";

test.beforeAll(() => {
  if (!QA_EMAIL || !QA_PASSWORD) {
    throw new Error("CAPPY_QA_EMAIL / CAPPY_QA_PASSWORD must be set (see apps/web/.env.e2e.example)");
  }
});

test("fully-unlocked QA account shows no locked achievement books", async ({ page }) => {
  await login(page, QA_EMAIL, QA_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/achievements");
  await expect(page.getByRole("heading", { name: "The Library of Milestones" })).toBeVisible();

  // BookshelfLibrary.tsx renders locked books as buttons with
  // aria-label="<name> (locked)" and disabled; unlocked ones as
  // aria-label='Open "<name>"'. A fully-unlocked account should have zero.
  await expect(page.getByRole("button", { name: /\(locked\)$/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Open "/ }).first()).toBeVisible();
});
