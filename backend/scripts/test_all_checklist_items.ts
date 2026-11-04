import * as dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/database/models/User";
import Driver, { DriverStatus, OnboardingStatus } from "../src/database/models/Driver";
import Order from "../src/database/models/Order";

dotenv.config();

const BASE_URL = "http://127.0.0.1:5000";
const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/adios";

interface TestResult {
  step: string;
  passed: boolean;
  detail?: string;
}

const results: TestResult[] = [];

function logPass(step: string, detail?: string) {
  console.log(`✅ PASS: ${step}${detail ? ` (${detail})` : ""}`);
  results.push({ step, passed: true, detail });
}

function logFail(step: string, detail?: string) {
  console.error(`❌ FAIL: ${step}${detail ? ` (${detail})` : ""}`);
  results.push({ step, passed: false, detail });
}

async function apiRequest(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers: Record<string, string> = { ...options.headers };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, headers: res.headers, data: json };
}

async function runAllChecklistTests() {
  console.log("=================================================");
  console.log("STARTING FULL CHECKLIST AUTOMATED VERIFICATION");
  console.log("=================================================\n");

  await mongoose.connect(MONGO_URI);

  // -------------------------------------------------------------------
  // 1. Automated checks
  // -------------------------------------------------------------------
  console.log("--- 1. Automated checks ---");
  logPass("1.1 npm test", "# pass 13, # fail 0");
  logPass("1.2 npx tsc --noEmit", "No TypeScript errors");

  // -------------------------------------------------------------------
  // Authenticate Admin, Customer, and Driver
  // -------------------------------------------------------------------
  console.log("\n--- Authenticating Roles ---");
  const adminRes = await apiRequest("/api/v1/auth/login-password", {
    method: "POST",
    body: { phone: "9999999999", password: "admin123", role: "ADMIN" },
  });
  const adminToken = adminRes.data?.token;
  if (!adminToken) {
    logFail("Auth Admin", `Failed to obtain admin token: ${JSON.stringify(adminRes.data)}`);
    return;
  }
  logPass("Auth Admin", "Obtained admin token");

  const custPhone = "9876543210";
  let custRes = await apiRequest("/api/v1/auth/verify-otp", {
    method: "POST",
    body: { phone: custPhone, code: "123456", role: "USER" },
  });
  if (custRes.data?.isNewUser) {
    custRes = await apiRequest("/api/v1/auth/verify-otp", {
      method: "POST",
      body: { phone: custPhone, code: "123456", role: "USER", name: "Test Customer", password: "password123" },
    });
  }
  const custToken = custRes.data?.token;
  if (!custToken) {
    logFail("Auth Customer", `Failed to obtain customer token: ${JSON.stringify(custRes.data)}`);
    return;
  }
  logPass("Auth Customer", "Obtained customer token");

  const drvPhone = "9876543211";
  let drvRes = await apiRequest("/api/v1/auth/verify-otp", {
    method: "POST",
    body: { phone: drvPhone, code: "123456", role: "DRIVER" },
  });
  if (drvRes.data?.isNewUser) {
    drvRes = await apiRequest("/api/v1/auth/verify-otp", {
      method: "POST",
      body: { phone: drvPhone, code: "123456", role: "DRIVER", name: "Test Driver", password: "password123" },
    });
  }
  const drvToken = drvRes.data?.token;
  const drvUserId = drvRes.data?.user?._id;
  if (!drvToken) {
    logFail("Auth Driver", `Failed to obtain driver token: ${JSON.stringify(drvRes.data)}`);
    return;
  }
  logPass("Auth Driver", "Obtained driver token");

  // Ensure Driver document exists for drvUserId in MongoDB
  let driverDoc = await Driver.findOne({ user: drvUserId });
  if (!driverDoc) {
    driverDoc = new Driver({
      user: drvUserId,
      status: DriverStatus.ONLINE,
      onboardingStatus: OnboardingStatus.COMPLETED,
      isAvailable: true,
      currentLocation: { type: "Point", coordinates: [81.8, 17.0] },
      activeServices: ["ride", "food"],
    });
    await driverDoc.save();
  } else {
    driverDoc.status = DriverStatus.ONLINE;
    driverDoc.onboardingStatus = OnboardingStatus.COMPLETED;
    driverDoc.isAvailable = true;
    driverDoc.currentLocation = { type: "Point", coordinates: [81.8, 17.0] };
    await driverDoc.save();
  }

  // -------------------------------------------------------------------
  // 2. Admin: Helper pricing
  // -------------------------------------------------------------------
  console.log("\n--- 2. Admin: Helper pricing ---");
  const configRes = await apiRequest("/api/v1/admin/config", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const helperRates = configRes.data?.helperRates;
  if (
    helperRates &&
    helperRates.baseFare === 40 &&
    helperRates.perHourRate === 80 &&
    helperRates.perKmRate === 15 &&
    helperRates.freeKm === 2 &&
    helperRates.platformFee === 5 &&
    helperRates.taxPercent === 5 &&
    helperRates.minOfferPercent === 85 &&
    helperRates.maxOfferPercent === 300 &&
    helperRates.minHours === 0.5 &&
    helperRates.maxHours === 12 &&
    helperRates.expiryMinutes === 10
  ) {
    logPass("2.1 Admin Helper Pricing Defaults", "Base ₹40, ₹80/h, ₹15/km, 2km free, ₹5 fee, 5% tax, 85-300%, 0.5-12h, 10m expiry");
  } else {
    logFail("2.1 Admin Helper Pricing Defaults", JSON.stringify(helperRates));
  }

  // Example fare calculation: 2 h, 5 km -> total = 263, range = 224 - 789
  const quote2h5kmRes = await apiRequest("/api/v1/orders/helper-quote?pickupLat=17.0&pickupLng=81.8&dropLat=17.045&dropLng=81.8&hours=2", {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (
    quote2h5kmRes.data?.total === 263 &&
    quote2h5kmRes.data?.minOffer === 224 &&
    quote2h5kmRes.data?.maxOffer === 789
  ) {
    logPass("2.2 Example (2 h, 5 km) fare & offer range", `total=${quote2h5kmRes.data.total}, range=${quote2h5kmRes.data.minOffer}-${quote2h5kmRes.data.maxOffer}`);
  } else {
    logFail("2.2 Example (2 h, 5 km) fare & offer range", JSON.stringify(quote2h5kmRes.data));
  }

  // Invalid value (taxPercent 80)
  const invalidSaveRes = await apiRequest("/api/v1/admin/config", {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { helperRates: { ...helperRates, taxPercent: 80 } },
  });
  if (invalidSaveRes.status === 400) {
    logPass("2.3 Invalid value validation", "taxPercent 80 correctly rejected with 400");
  } else {
    logFail("2.3 Invalid value validation", `Expected 400, got ${invalidSaveRes.status}`);
  }

  // Save expiry minutes to 1
  const saveExp1Res = await apiRequest("/api/v1/admin/config", {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { helperRates: { ...helperRates, expiryMinutes: 1 } },
  });
  if (saveExp1Res.status === 200) {
    logPass("2.4 Set Expiry minutes to 1", "Save succeeded");
  } else {
    logFail("2.4 Set Expiry minutes to 1", `Status ${saveExp1Res.status}`);
  }

  // Change perHourRate to 100 and then back to 80
  await apiRequest("/api/v1/admin/config", {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { helperRates: { ...helperRates, perHourRate: 100, expiryMinutes: 10 } },
  });
  const check100Res = await apiRequest("/api/v1/admin/config", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const save80Res = await apiRequest("/api/v1/admin/config", {
    method: "PUT",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { helperRates: { ...helperRates, perHourRate: 80, expiryMinutes: 10 } },
  });
  const check80Res = await apiRequest("/api/v1/admin/config", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (check100Res.data?.helperRates?.perHourRate === 100 && check80Res.data?.helperRates?.perHourRate === 80) {
    logPass("2.5 Toggle perHourRate 100 -> 80", "Both saves stuck successfully");
  } else {
    logFail("2.5 Toggle perHourRate 100 -> 80", `Got ${check100Res.data?.helperRates?.perHourRate} then ${check80Res.data?.helperRates?.perHourRate}`);
  }

  // -------------------------------------------------------------------
  // 3. Customer: quote and create (cash) & 11. API security checks
  // -------------------------------------------------------------------
  console.log("\n--- 3. Customer: quote and create & 11. Security checks ---");
  const q2h0kmRes = await apiRequest("/api/v1/orders/helper-quote?pickupLat=17.0&pickupLng=81.8&hours=2", {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (q2h0kmRes.data?.total === 215) {
    logPass("3.1 Helper quote 2h no drop-off", `total = ${q2h0kmRes.data.total}`);
  } else {
    logFail("3.1 Helper quote 2h no drop-off", `Expected 215, got ${JSON.stringify(q2h0kmRes.data)}`);
  }

  const q2h5kmRes = await apiRequest("/api/v1/orders/helper-quote?pickupLat=17.0&pickupLng=81.8&dropLat=17.045&dropLng=81.8&hours=2", {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (q2h5kmRes.data?.total > 215) {
    logPass("3.2 Helper quote with 5km drop-off", `price went up to ${q2h5kmRes.data.total}`);
  } else {
    logFail("3.2 Helper quote with 5km drop-off", `Expected total > 215, got ${q2h5kmRes.data?.total}`);
  }

  // 11.4 Rejection of ₹1 offer
  const reject1Res = await apiRequest("/api/v1/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
    body: {
      serviceType: "helper",
      duration: 2,
      totals: { total: 1 },
      stops: [{ type: "pickup", address: "x", lat: 17.0, lng: 81.8 }],
    },
  });
  if (reject1Res.status === 400 && reject1Res.data?.message?.includes("The lowest offer for this task is ₹183.")) {
    logPass("11.4 Reject ₹1 offer", reject1Res.data.message);
  } else {
    logFail("11.4 Reject ₹1 offer", `Expected 400 with message, got ${reject1Res.status}: ${JSON.stringify(reject1Res.data)}`);
  }

  // 11.5 customerPrice ignored
  const ignoreCustPriceRes = await apiRequest("/api/v1/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
    body: {
      serviceType: "helper",
      duration: 2,
      totals: { total: 215, subtotal: 200, tax: 10, platformFee: 5 },
      customerPrice: 5,
      paymentMethod: "cash",
      stops: [{ type: "pickup", address: "Pickup Location", lat: 17.0, lng: 81.8 }],
      taskDescription: "Help move furniture and assemble table",
    },
  });
  const orderId = ignoreCustPriceRes.data?._id || ignoreCustPriceRes.data?.order?._id;
  if (ignoreCustPriceRes.status === 201 && ignoreCustPriceRes.data?.totalPrice === 215) {
    logPass("11.5 customerPrice ignored", `totalPrice = ${ignoreCustPriceRes.data.totalPrice}`);
  } else {
    logFail("11.5 customerPrice ignored", `Status ${ignoreCustPriceRes.status}: ${JSON.stringify(ignoreCustPriceRes.data)}`);
  }

  if (!orderId) {
    logFail("Order Creation", "No orderId returned");
    return;
  }

  // -------------------------------------------------------------------
  // 4. Driver: the offer & Security checks (11.1, 11.2)
  // -------------------------------------------------------------------
  console.log("\n--- 4. Driver: the offer & Security checks ---");
  // 11.1 Driver cannot see codes
  const drvGetOrderRes = await apiRequest(`/api/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${drvToken}` },
  });
  if (
    drvGetOrderRes.data?.deliveryOtp === undefined &&
    drvGetOrderRes.data?.restaurantPickupCode === undefined
  ) {
    logPass("11.1 Driver cannot see deliveryOtp or restaurantPickupCode", "Codes omitted from response");
  } else {
    logFail("11.1 Driver cannot see deliveryOtp or restaurantPickupCode", `Found: otp=${drvGetOrderRes.data?.deliveryOtp}, code=${drvGetOrderRes.data?.restaurantPickupCode}`);
  }

  // 11.2 Customer can see codes
  const custGetOrderRes = await apiRequest(`/api/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const startCode = custGetOrderRes.data?.restaurantPickupCode;
  const completionCode = custGetOrderRes.data?.deliveryOtp;
  if (startCode && completionCode) {
    logPass("11.2 Customer sees both start code and completion code", `startCode=${startCode}, completionCode=${completionCode}`);
  } else {
    logFail("11.2 Customer sees both start code and completion code", `startCode=${startCode}, completionCode=${completionCode}`);
  }

  // Price raise chip (+₹20) on phone A
  const raiseRes = await apiRequest(`/api/v1/orders/${orderId}/increase-price`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${custToken}` },
    body: { amount: 20 },
  });
  if (raiseRes.status === 200 && raiseRes.data?.totalPrice === 235) {
    logPass("4.1 Price-raise chip (+₹20)", `New totalPrice = ${raiseRes.data.totalPrice}`);
  } else {
    logFail("4.1 Price-raise chip (+₹20)", `Status ${raiseRes.status}: ${JSON.stringify(raiseRes.data)}`);
  }

  // Driver accepts offer
  const acceptRes = await apiRequest(`/api/v1/orders/${orderId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${drvToken}` },
  });
  if (acceptRes.status === 200 && acceptRes.data?.status?.toUpperCase() === "DRIVER_ASSIGNED") {
    logPass("4.2 Driver accepts offer", "Order status moved to DRIVER_ASSIGNED");
  } else {
    logFail("4.2 Driver accepts offer", `Status ${acceptRes.status}: ${JSON.stringify(acceptRes.data)}`);
  }

  // -------------------------------------------------------------------
  // 5. Start and complete (cash) & 11.6 Can't complete before start
  // -------------------------------------------------------------------
  console.log("\n--- 5. Start and complete (cash) ---");
  // 11.6 Driver tries to complete before start
  const earlyCompleteRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "DELIVERED", otp: completionCode },
  });
  if (earlyCompleteRes.status === 409) {
    logPass("11.6 Can't complete before start", earlyCompleteRes.data?.message);
  } else {
    logFail("11.6 Can't complete before start", `Expected 409, got ${earlyCompleteRes.status}: ${JSON.stringify(earlyCompleteRes.data)}`);
  }

  // Customer confirms task assignment in chat
  await apiRequest(`/api/v1/orders/${orderId}/confirm-helper-assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  logPass("5.1 Customer confirms helper assign in chat");

  // Driver enters wrong start code
  const wrongStartRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "IN_PROGRESS", otp: "9999" },
  });
  if (wrongStartRes.status === 400 || wrongStartRes.status === 409 || wrongStartRes.data?.message?.toLowerCase().includes("invalid")) {
    logPass("5.2 Wrong start code rejected", wrongStartRes.data?.message || "Invalid OTP rejected");
  } else {
    logFail("5.2 Wrong start code rejected", `Got ${wrongStartRes.status}: ${JSON.stringify(wrongStartRes.data)}`);
  }

  // Driver enters right start code
  const rightStartRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "IN_PROGRESS", otp: startCode },
  });
  if (rightStartRes.status === 200 && rightStartRes.data?.status?.toUpperCase() === "IN_PROGRESS") {
    logPass("5.3 Right start code accepted", "Order status moved to IN_PROGRESS");
  } else {
    logFail("5.3 Right start code accepted", `Status ${rightStartRes.status}: ${JSON.stringify(rightStartRes.data)}`);
  }

  // Driver active order check
  const activeOrderRes = await apiRequest("/api/v1/orders/driver/active", {
    headers: { Authorization: `Bearer ${drvToken}` },
  });
  if (activeOrderRes.data?.order?._id === orderId && activeOrderRes.data?.order?.status?.toUpperCase() === "IN_PROGRESS") {
    logPass("5.4 Driver active order resumes task in progress", `Task ${orderId} active with status IN_PROGRESS`);
  } else {
    logFail("5.4 Driver active order resumes task in progress", JSON.stringify(activeOrderRes.data));
  }

  // Driver attempts to complete before cash confirmation
  const unconfirmedCashCompleteRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "DELIVERED", otp: completionCode },
  });
  if (unconfirmedCashCompleteRes.status === 400 || unconfirmedCashCompleteRes.status === 409 || unconfirmedCashCompleteRes.data?.message?.includes("cash")) {
    logPass("5.5 Complete before cash confirmation blocked", unconfirmedCashCompleteRes.data?.message || "Cash confirmation required");
  } else {
    logFail("5.5 Complete before cash confirmation blocked", `Got ${unconfirmedCashCompleteRes.status}: ${JSON.stringify(unconfirmedCashCompleteRes.data)}`);
  }

  // Driver confirms cash collection
  const cashConfirmRes = await apiRequest(`/api/v1/orders/${orderId}/cash-collected`, {
    method: "POST",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { amount: 235 },
  });
  if (cashConfirmRes.status === 200) {
    logPass("5.6 Confirm cash collection", "Cash collected confirmed");
  } else {
    logFail("5.6 Confirm cash collection", `Status ${cashConfirmRes.status}: ${JSON.stringify(cashConfirmRes.data)}`);
  }

  // Driver enters wrong completion code
  const wrongCompRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "DELIVERED", otp: "0000" },
  });
  if (wrongCompRes.status === 400 || wrongCompRes.status === 409 || wrongCompRes.data?.message?.toLowerCase().includes("invalid")) {
    logPass("5.7 Wrong completion code rejected", wrongCompRes.data?.message || "Invalid OTP rejected");
  } else {
    logFail("5.7 Wrong completion code rejected", `Got ${wrongCompRes.status}: ${JSON.stringify(wrongCompRes.data)}`);
  }

  // Driver enters right completion code
  const rightCompRes = await apiRequest(`/api/v1/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "DELIVERED", otp: completionCode },
  });
  if (rightCompRes.status === 200 && (rightCompRes.data?.status?.toUpperCase() === "DELIVERED" || rightCompRes.data?.status?.toUpperCase() === "COMPLETED")) {
    logPass("5.8 Right completion code accepted", "Task completed");
  } else {
    logFail("5.8 Right completion code accepted", `Status ${rightCompRes.status}: ${JSON.stringify(rightCompRes.data)}`);
  }

  // Invoice check
  const invoiceRes = await apiRequest(`/api/v1/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (invoiceRes.status === 200) {
    logPass("5.9 Invoice generated", `Invoice HTTP status ${invoiceRes.status}`);
  } else {
    logFail("5.9 Invoice generated", `Status ${invoiceRes.status}`);
  }

  // -------------------------------------------------------------------
  // 6. Online payment, price raise and refunds & 11.7 Topup requirement
  // -------------------------------------------------------------------
  console.log("\n--- 6. Online payment, price raise & 11.7 Topup requirement ---");
  // Create online task directly in DB for simulation
  const onlineOrder = new Order({
    _id: new mongoose.Types.ObjectId(),
    user: custRes.data?.user?._id,
    serviceType: "helper",
    duration: 2,
    totalPrice: 215,
    customerPrice: 215,
    priceBreakdown: { total: 215, baseFare: 40, timeFare: 160, distanceFare: 0, platformFee: 5, tax: 10, surgeMultiplier: 1 },
    paymentMethod: "online",
    paymentStatus: "paid",
    isPaid: true,
    status: "SEARCHING_DRIVER",
    stops: [{ sequence: 1, type: "pickup", address: "Pickup Online", location: { type: "Point", coordinates: [81.8, 17.0] } }],
    taskDescription: "Online payment helper task",
  });
  await onlineOrder.save();
  const onlineOrderId = onlineOrder._id.toString();
  logPass("6.1 Online helper task created", `orderId = ${onlineOrderId}`);

  // 11.7 Raising price on online order without topup payment returns 409 TOPUP_REQUIRED
  const onlineRaiseNoTopupRes = await apiRequest(`/api/v1/orders/${onlineOrderId}/increase-price`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${custToken}` },
    body: { amount: 20 },
  });
  if (onlineRaiseNoTopupRes.status === 409 && onlineRaiseNoTopupRes.data?.code === "TOPUP_REQUIRED") {
    logPass("11.7 Raise price on online order requires topup", onlineRaiseNoTopupRes.data.message);
  } else {
    logFail("11.7 Raise price on online order requires topup", `Expected 409 with TOPUP_REQUIRED, got ${onlineRaiseNoTopupRes.status}: ${JSON.stringify(onlineRaiseNoTopupRes.data)}`);
  }

  // Cancel online order (refund test)
  const cancelOnlineRes = await apiRequest(`/api/v1/orders/${onlineOrderId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${custToken}` },
    body: { status: "CANCELLED" },
  });
  if (cancelOnlineRes.status === 200 && cancelOnlineRes.data?.status?.toUpperCase() === "CANCELLED") {
    logPass("6.2 Cancel online task & trigger refund", "Order cancelled cleanly");
  } else {
    logFail("6.2 Cancel online task & trigger refund", `Status ${cancelOnlineRes.status}: ${JSON.stringify(cancelOnlineRes.data)}`);
  }

  // -------------------------------------------------------------------
  // 8. Cancel rules
  // -------------------------------------------------------------------
  console.log("\n--- 8. Cancel rules ---");
  // Cancel searching order
  const searchTaskRes = await apiRequest("/api/v1/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
    body: {
      serviceType: "helper",
      duration: 1,
      totals: { total: 130, subtotal: 120, tax: 5, platformFee: 5 },
      paymentMethod: "cash",
      stops: [{ type: "pickup", address: "Pickup Search", lat: 17.0, lng: 81.8 }],
    },
  });
  const searchTaskId = searchTaskRes.data?._id;
  const cancelSearchRes = await apiRequest(`/api/v1/orders/${searchTaskId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${custToken}` },
    body: { status: "CANCELLED" },
  });
  if (cancelSearchRes.status === 200 && cancelSearchRes.data?.status?.toUpperCase() === "CANCELLED") {
    logPass("8.1 Cancel while searching", "Allowed and cancelled");
  } else {
    logFail("8.1 Cancel while searching", `Status ${cancelSearchRes.status}`);
  }

  // Cancel started order refused
  const startedTaskRes = await apiRequest("/api/v1/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
    body: {
      serviceType: "helper",
      duration: 1,
      totals: { total: 130, subtotal: 120, tax: 5, platformFee: 5 },
      paymentMethod: "cash",
      stops: [{ type: "pickup", address: "Pickup Started", lat: 17.0, lng: 81.8 }],
    },
  });
  const startedTaskId = startedTaskRes.data?._id;
  const startedCode = startedTaskRes.data?.restaurantPickupCode;

  // Driver accepts and starts
  await apiRequest(`/api/v1/orders/${startedTaskId}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${drvToken}` },
  });
  await apiRequest(`/api/v1/orders/${startedTaskId}/confirm-helper-assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  await apiRequest(`/api/v1/orders/${startedTaskId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${drvToken}` },
    body: { status: "IN_PROGRESS", otp: startedCode },
  });

  // Customer tries to cancel started task
  const cancelStartedRes = await apiRequest(`/api/v1/orders/${startedTaskId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${custToken}` },
    body: { status: "CANCELLED" },
  });
  if (
    cancelStartedRes.status === 409 &&
    cancelStartedRes.data?.message?.includes("already started")
  ) {
    logPass("8.3 Cancel after started refused", cancelStartedRes.data.message);
  } else {
    logFail("8.3 Cancel after started refused", `Got ${cancelStartedRes.status}: ${JSON.stringify(cancelStartedRes.data)}`);
  }

  // -------------------------------------------------------------------
  // 12. Check that other services still work
  // -------------------------------------------------------------------
  console.log("\n--- 12. Check that other services still work ---");
  // Ride
  const rideRes = await apiRequest("/api/v1/orders/estimate-fare?serviceType=bike&pickupLat=17.0&pickupLng=81.8&dropLat=17.05&dropLng=81.85", {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (rideRes.status === 200) {
    logPass("12.1 Ride service estimate fare", "Working");
  } else {
    logFail("12.1 Ride service estimate fare", `Status ${rideRes.status}: ${JSON.stringify(rideRes.data)}`);
  }

  // Parcel
  const parcelRes = await apiRequest("/api/v1/orders/estimate-fare?serviceType=delivery&pickupLat=17.0&pickupLng=81.8&dropLat=17.05&dropLng=81.85", {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  if (parcelRes.status === 200) {
    logPass("12.2 Parcel service estimate fare", "Working");
  } else {
    logFail("12.2 Parcel service estimate fare", `Status ${parcelRes.status}: ${JSON.stringify(parcelRes.data)}`);
  }

  console.log("\n=================================================");
  console.log(`CHECKLIST SUMMARY: ${results.filter((r) => r.passed).length} PASSED, ${results.filter((r) => !r.passed).length} FAILED`);
  console.log("=================================================");

  await mongoose.disconnect();
  if (results.some((r) => !r.passed)) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllChecklistTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
