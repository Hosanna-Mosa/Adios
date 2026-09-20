import { test, expect } from "@playwright/test";

// Access-boundary coverage for every route in AnimatedRoutes.tsx, added as
// part of the refactor's final QA pass (see the .map()-audit follow-up).
//
// RequireAuth/RequireVendor (src/components/RequireAuth.tsx) are pure
// synchronous localStorage checks -- no API call happens before the
// redirect -- so this genuinely needs no backend, no database, and no
// credentials. It is real, verifiable coverage of one specific thing: that
// a signed-out visitor cannot reach any protected page's content, for
// every page the refactor touched.
//
// It is NOT the plan's full 3-role signed-in visual-regression baseline
// suite (06-A/06-F in the refactor plan). That suite needs a reachable
// backend + a seeded MongoDB + admin/support/vendor credentials logged in
// through the one shared /vendor-login form (there is no separate
// /admin-login or /support-login route -- see RootRedirect and
// useVendorLogin.ts, which branch on the backend's returned `role`).
// None of that infrastructure is configured in this environment (no
// admin/.env, no backend/.env, MongoDB unreachable on 27017), so that
// suite is out of reach here without inventing credentials or spinning up
// infrastructure this task didn't ask for -- see the accompanying report.

const adminOrSupportRoutes = [
  "/dashboard",
  "/live-orders",
  "/live-orders/test-id",
  "/scheduled-orders",
  "/drivers",
  "/dev-drivers",
  "/analytics",
  "/payments",
  "/support",
  "/support-cases",
  "/support/chats",
  "/support/chats/test-id",
  "/users",
  "/vendors",
  "/restaurant-menu",
  "/meat-centers",
  "/meat-pricing",
  "/zones",
  "/banners",
  "/coupons",
  "/users/test-id",
  "/drivers/test-id",
  "/app-updates",
];

const vendorRoutes = [
  "/vendor/dashboard",
  "/vendor/scheduled-orders",
  "/vendor/menu",
  "/vendor/meat-menu",
  "/vendor/settings",
];

test.describe("RequireAuth-gated routes redirect when signed out", () => {
  for (const path of adminOrSupportRoutes) {
    test(`${path} redirects to /vendor-login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/vendor-login$/);
    });
  }
});

test.describe("RequireVendor-gated routes redirect when signed out", () => {
  for (const path of vendorRoutes) {
    test(`${path} redirects to /vendor-login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/vendor-login$/);
    });
  }
});

test("an unknown route renders the NotFound page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("Oops! Page not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to Home" })).toBeVisible();
});

test("vendor-login's forgot-password link swaps in the reset flow", async ({ page }) => {
  await page.goto("/vendor-login");
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible();
  await expect(page.getByText("Enter your registered email to receive an OTP.")).toBeVisible();
});
