import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// Real test account (Cappy backend): normal/default user with
// organically-earned progress (not force-unlocked). Credentials are read
// from env vars only -- see apps/web/.env.e2e.example.
const USER_EMAIL = process.env.CAPPY_USER0_EMAIL ?? "";
const USER_PASSWORD = process.env.CAPPY_USER0_PASSWORD ?? "";

test.beforeAll(() => {
  if (!USER_EMAIL || !USER_PASSWORD) {
    throw new Error("CAPPY_USER0_EMAIL / CAPPY_USER0_PASSWORD must be set (see apps/web/.env.e2e.example)");
  }
});

test("signs in with password and lands on /dashboard", async ({ page }) => {
  await login(page, USER_EMAIL, USER_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /^Hi,/ })).toBeVisible();
});
