// Resets test accounts left in a "changed" state from a previous test run
// back to their baseline, using the real API (not direct DB writes).
import dotenv from "dotenv";
dotenv.config();

const BASE = "http://localhost:3000/api/v1";

// Safety guard (matches seed-iam-test-accounts.ts): this script mutates
// account state (passwords, onboarding status) for fixed test phone numbers.
// Refuse to run unless the backend on this port is demonstrably pointed at
// the isolated test database, so this can never silently touch production
// or the real `projectx` database if someone runs it from the wrong context.
function assertIsolatedTestEnvironment() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(
      `Refusing to run — DATABASE_URL does not look like the isolated test DB: ${dbUrl || "(unset)"}. ` +
        `This script resets fixed test accounts (9000000001, 9000000005, 9000000006) and must only run ` +
        `against the isolated test backend's own .env.`
    );
  }
}

async function tryLogin(phone: string, password: string, role?: string) {
  const url = role ? `${BASE}/auth/login-password` : `${BASE}/vendors/login`;
  const body = role ? { phone, password, role } : { phone, password };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (res.status !== 200) return null;
  return res.json();
}

async function main() {
  assertIsolatedTestEnvironment();

  // User: might be on TestUser#2026 (baseline) or NewTestUser#2026 (left over)
  let user = await tryLogin("9000000001", "TestUser#2026", "USER");
  if (!user) {
    user = await tryLogin("9000000001", "NewTestUser#2026", "USER");
    if (user) {
      await fetch(`${BASE}/users/change-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: "NewTestUser#2026", newPassword: "TestUser#2026" }),
      });
      console.log("reset: user 9000000001 password restored");
    } else {
      console.log("WARN: could not log in to user 9000000001 with either password");
    }
  } else {
    console.log("ok: user 9000000001 already at baseline password");
  }

  // Vendor: same pattern
  let vendor = await tryLogin("9000000005", "TestVendor#2026");
  if (!vendor) {
    vendor = await tryLogin("9000000005", "NewTestVendor#2026");
    if (vendor) {
      await fetch(`${BASE}/vendors/change-password`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${vendor.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: "NewTestVendor#2026", newPassword: "TestVendor#2026" }),
      });
      console.log("reset: vendor 9000000005 password restored");
    } else {
      console.log("WARN: could not log in to vendor 9000000005 with either password");
    }
  } else {
    console.log("ok: vendor 9000000005 already at baseline password");
  }

  // Vendor2 onboardingStatus: reset to approved via admin, regardless of current state
  const admin = await tryLogin("9999999999", "admin123", "ADMIN");
  if (admin) {
    const vendor2 = await tryLogin("9000000006", "TestVendor2#2026");
    if (vendor2) {
      await fetch(`${BASE}/vendors/${vendor2._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${admin.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStatus: "approved", isBlocked: false }),
      });
      console.log("reset: vendor2 onboardingStatus set to approved");
    }
  }

  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
