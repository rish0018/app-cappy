import type { Page } from "@playwright/test";

/**
 * App.tsx gates every route behind a one-time 5s cinematic Loader keyed off
 * sessionStorage("cappy-intro-shown") (see App.tsx INTRO_SESSION_KEY). Set it
 * before first navigation so tests don't have to sit through the intro.
 */
export async function skipIntro(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("cappy-intro-shown", "1");
  });
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await skipIntro(page);
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
