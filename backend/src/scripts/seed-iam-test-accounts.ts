// One-off script for the IAM/RBAC/token testing assignment. Creates fixed,
// clearly-fake test accounts in the ISOLATED test database only. Safe to
// re-run — upserts by phone/email rather than duplicating.
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User, { UserRole } from "../database/models/User";
import Vendor from "../database/models/Vendor";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("iam_rbac_test")) {
    throw new Error(`Refusing to seed — DATABASE_URL does not look like the isolated test DB: ${dbUrl}`);
  }
  await mongoose.connect(dbUrl);

  const accounts = [
    { phone: "9000000001", email: "iam-test-user@test.local", name: "IAM Test User", role: UserRole.USER, password: "TestUser#2026" },
    { phone: "9000000002", email: "iam-test-driver@test.local", name: "IAM Test Driver", role: UserRole.DRIVER, password: "TestDriver#2026" },
    { phone: "9000000004", email: "iam-test-support@test.local", name: "IAM Test Support", role: UserRole.SUPPORT, password: "TestSupport#2026" },
  ];

  for (const acc of accounts) {
    const existing = await User.findOne({ phone: acc.phone });
    if (existing) {
      console.log(`exists: ${acc.role} ${acc.phone}`);
      continue;
    }
    const user = new User(acc as any);
    await user.save();
    console.log(`created: ${acc.role} ${acc.phone} / ${acc.email}`);
  }

  // Vendor (restaurant partner) test account
  const vendorExisting = await Vendor.findOne({ phone: "9000000005" });
  if (!vendorExisting) {
    const vendor = new Vendor({
      name: "IAM Test Vendor",
      phone: "9000000005",
      email: "iam-test-vendor@test.local",
      password: "TestVendor#2026",
      partnerType: "food",
      verificationStatus: "approved",
      isActive: true,
      address: "Test Address 1, Isolated Test DB",
      location: { type: "Point", coordinates: [78.4867, 17.385] },
    } as any);
    await vendor.save();
    console.log(`created: vendor ${vendor._id}`);
  } else {
    console.log(`exists: vendor ${vendorExisting._id}`);
  }

  // Second vendor, for cross-vendor isolation testing (IDOR checks)
  const vendor2Existing = await Vendor.findOne({ phone: "9000000006" });
  if (!vendor2Existing) {
    const vendor2 = new Vendor({
      name: "IAM Test Vendor Two",
      phone: "9000000006",
      email: "iam-test-vendor-2@test.local",
      password: "TestVendor2#2026",
      partnerType: "food",
      verificationStatus: "approved",
      isActive: true,
      address: "Test Address 2, Isolated Test DB",
      location: { type: "Point", coordinates: [78.49, 17.39] },
    } as any);
    await vendor2.save();
    console.log(`created: vendor2 ${vendor2._id}`);
  } else {
    console.log(`exists: vendor2 ${vendor2Existing._id}`);
  }

  // Second plain user, for cross-user isolation testing (IDOR checks)
  const user2Existing = await User.findOne({ phone: "9000000003" });
  if (!user2Existing) {
    const user2 = new User({
      phone: "9000000003",
      email: "iam-test-user-2@test.local",
      name: "IAM Test User Two",
      role: UserRole.USER,
      password: "TestUser2#2026",
    } as any);
    await user2.save();
    console.log(`created: USER 9000000003 (second user)`);
  } else {
    console.log(`exists: USER 9000000003`);
  }

  console.log("Note: ADMIN not seeded here — real admin login is restricted to one hardcoded phone (isAdminPhone check), not creatable generically. Will inspect that config value separately, without printing it, to decide how to test admin role.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
