import { test, expect } from "@playwright/test";

// Minimal smoke test proving the Playwright pipeline itself works end to
// end (config -> dev server -> browser -> assertion) against this app,
// without needing a running backend/database. It intentionally only checks
// unauthenticated, static rendering: RootRedirect sends a signed-out visitor
// to /vendor-login (see components/motion/AnimatedRoutes.tsx), and that page
// renders without any API call succeeding.
//
// This unblocks `npx playwright test` for the admin refactor plan's
// verification loop; it is not the plan's full 28-page / 3-role baseline
// suite, which needs a running backend + seeded credentials for each role
// (admin/support/vendor) that this environment does not have configured.
test("signed-out root redirects to the vendor login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/vendor-login$/);
  await expect(page.getByRole("heading", { name: "Vendor Portal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});
