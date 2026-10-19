import mongoose from "mongoose";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../database/models/User";
import Order from "../database/models/Order";
import SupportAuditLog from "../database/models/SupportAuditLog";

dotenv.config();

const API = "http://127.0.0.1:5000/api/v1";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

async function runTests() {
  await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/logistics-platform");

  // 1. Get Support User & Token
  const supportUser = await User.findOne({ role: UserRole.SUPPORT });
  if (!supportUser) throw new Error("No support user found!");
  const supportToken = jwt.sign({ userId: supportUser._id.toString(), id: supportUser._id.toString(), role: "SUPPORT" }, JWT_SECRET, { expiresIn: "1d" });

  // 2. Get Admin User & Token
  const adminUser = await User.findOne({ role: UserRole.ADMIN });
  if (!adminUser) throw new Error("No admin user found!");
  const adminToken = jwt.sign({ userId: adminUser._id.toString(), id: adminUser._id.toString(), role: "ADMIN" }, JWT_SECRET, { expiresIn: "1d" });

  // 3. Get Customer & Driver Users & Tokens
  let customerUser = await User.findOne({ role: UserRole.USER });
  if (!customerUser) {
    customerUser = new User({ name: "Test User", phone: "9000000001", role: UserRole.USER });
    await customerUser.save();
  }
  const customerToken = jwt.sign({ userId: customerUser._id.toString(), id: customerUser._id.toString(), role: "USER" }, JWT_SECRET, { expiresIn: "1d" });

  let driverUser = await User.findOne({ role: UserRole.DRIVER });
  if (!driverUser) {
    driverUser = new User({ name: "Test Driver", phone: "9000000002", role: UserRole.DRIVER });
    await driverUser.save();
  }
  const driverToken = jwt.sign({ userId: driverUser._id.toString(), id: driverUser._id.toString(), role: "DRIVER" }, JWT_SECRET, { expiresIn: "1d" });

  // 4. Find an order ID to test with
  const testOrder = await Order.findOne({ deliveryOtp: { $exists: true, $ne: "" } }) || await Order.findOne();
  if (!testOrder) throw new Error("No order found in DB!");
  const orderId = testOrder._id.toString();
  console.log(`Testing with orderId: ${orderId}, raw deliveryOtp: ${(testOrder as any).deliveryOtp}, pickupCode: ${(testOrder as any).restaurantPickupCode}`);

  const results: Record<string, any> = {};

  // Check 5.1: Support Token - GET /support/orders?q=$ID (expect 200)
  const resSupportSearch = await fetch(`${API}/support/orders?q=${orderId}`, {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  results["5.1_support_search_status"] = resSupportSearch.status;
  const searchJson = await resSupportSearch.json();
  results["5.1_support_search_count"] = (searchJson as any).orders?.length || (searchJson as any).data?.length || (searchJson as any).length;

  // Check 5.2: Support Token - GET /support/orders/$ID (expect 200)
  const resSupportDetail = await fetch(`${API}/support/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  results["5.2_support_detail_status"] = resSupportDetail.status;
  const detailText = await resSupportDetail.text();
  const detailJson = JSON.parse(detailText);

  // Check 5.3: The response must contain no OTP or pickup code
  const hasOtpOrPickupCode = /otp|pickupcode/i.test(detailText);
  results["5.3_no_otp_or_pickupCode"] = !hasOtpOrPickupCode;
  results["5.3_regex_match_found"] = hasOtpOrPickupCode;

  // Check 5.4: Blocked for support: GET /orders/$ID (expect 404)
  const resSupportOrdersGet = await fetch(`${API}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  results["5.4_support_get_order_status"] = resSupportOrdersGet.status;

  // Check 5.5: Blocked for support: GET /orders/$ID/invoice (expect 404)
  const resSupportInvoice = await fetch(`${API}/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  results["5.5_support_get_invoice_status"] = resSupportInvoice.status;

  // Check 5.6: Blocked for support: PATCH /orders/$ID/status (expect 403)
  const resSupportPatchStatus = await fetch(`${API}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${supportToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "CANCELLED" })
  });
  results["5.6_support_patch_status"] = resSupportPatchStatus.status;

  // Check 5.7: Customer token calling /support/orders returns 403
  const resCustomerSupportOrders = await fetch(`${API}/support/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  results["5.7_customer_support_status"] = resCustomerSupportOrders.status;

  // Check 5.8: Driver token calling /support/orders returns 403
  const resDriverSupportOrders = await fetch(`${API}/support/orders`, {
    headers: { Authorization: `Bearer ${driverToken}` }
  });
  results["5.8_driver_support_status"] = resDriverSupportOrders.status;

  // Check 5.9: Admin token: /orders/$ID returns 200
  const resAdminOrder = await fetch(`${API}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  results["5.9_admin_order_status"] = resAdminOrder.status;

  // Check 5.10: Admin token: /orders/$ID/invoice returns 200 or generates invoice
  const resAdminInvoice = await fetch(`${API}/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  results["5.10_admin_invoice_status"] = resAdminInvoice.status;

  // Check 6: Audit log
  // Sleep 1 second for async audit log write
  await new Promise(r => setTimeout(r, 1000));
  const recentAuditLogs = await SupportAuditLog.find().sort({ createdAt: -1 }).limit(5).lean();
  results["6.audit_logs_count"] = recentAuditLogs.length;
  results["6.audit_logs"] = recentAuditLogs.map(l => ({
    actor: l.actor,
    actorRole: l.actorRole,
    action: l.action,
    orderId: l.orderId,
    createdAt: l.createdAt
  }));

  console.log("\n=== TEST RESULTS SUMMARY ===");
  console.log(JSON.stringify(results, null, 2));

  process.exit(0);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
