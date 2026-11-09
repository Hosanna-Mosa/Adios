import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Order from "../database/models/Order";
import ChatMessage from "../database/models/ChatMessage";
import SupportTicket from "../database/models/SupportTicket";
import Vendor from "../database/models/Vendor";
import User from "../database/models/User";
import Driver from "../database/models/Driver";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/logistics-platform";

async function findTestOrders() {
  await mongoose.connect(MONGO_URI);

  // 1. Order with chat
  const chatMessages = await ChatMessage.find().limit(20).lean();
  console.log("Sample chat message orderIds:", [...new Set(chatMessages.map(c => c.orderId))]);
  const chatOrderId = chatMessages[0]?.orderId;
  const orderWithChat = await Order.findById(chatOrderId).populate("user").populate("driver").lean();

  // 2. Food order
  const foodOrder = await Order.findOne(<any>{ serviceType: "delivery", vendor: { $exists: true, $ne: null } })
    .populate("user")
    .populate("vendor")
    .populate("driver")
    .lean();

  // 3. Ride order
  const rideOrder = await Order.findOne(<any>{ serviceType: { $in: ["bike", "auto", "cab_economy", "cab_premium"] }, packageDelivery: { $exists: false } })
    .populate("user")
    .populate("driver")
    .lean();

  // 4. Package delivery
  const packageOrder = await Order.findOne(<any>{ packageDelivery: { $exists: true, $ne: null } })
    .populate("user")
    .populate("driver")
    .lean();

  // 5. Helper task
  const helperOrder = await Order.findOne(<any>{ serviceType: "helper" })
    .populate("user")
    .populate("driver")
    .lean();

  // 6. Cancelled order with reason
  const cancelledOrder = await Order.findOne(<any>{ status: { $in: ["CANCELLED", "cancelled"] }, cancelReason: { $exists: true, $ne: null } })
    .populate("user")
    .lean();

  // 7. Refunded order
  const refundedOrder = await Order.findOne(<any>{
    $or: [
      { refundStatus: { $exists: true, $ne: null } },
      { razorpayRefundId: { $exists: true, $ne: null } },
      { refundAmount: { $gt: 0 } }
    ]
  }).lean();

  console.log("\n=== FOUND TEST CASES ===");
  console.log("Order with Chat:", {
    id: orderWithChat?._id,
    type: orderWithChat?.serviceType,
    status: orderWithChat?.status,
    customer: (orderWithChat?.user as any)?.name,
    customerPhone: (orderWithChat?.user as any)?.phone,
  });

  console.log("Food Order:", {
    id: foodOrder?._id,
    status: foodOrder?.status,
    restaurant: (foodOrder?.vendor as any)?.name,
    items: (foodOrder as any)?.items?.length || (foodOrder as any)?.stops?.[0]?.items?.lines?.length,
    customer: (foodOrder?.user as any)?.name,
    customerPhone: (foodOrder?.user as any)?.phone,
  });

  console.log("Ride Order:", {
    id: rideOrder?._id,
    type: rideOrder?.serviceType,
    status: rideOrder?.status,
    customer: (rideOrder?.user as any)?.name,
    customerPhone: (rideOrder?.user as any)?.phone,
  });

  console.log("Package Order:", {
    id: packageOrder?._id,
    packageDelivery: packageOrder?.packageDelivery,
    customer: (packageOrder?.user as any)?.name,
  });

  console.log("Helper Order:", {
    id: helperOrder?._id,
    status: helperOrder?.status,
    customer: (helperOrder?.user as any)?.name,
  });

  console.log("Cancelled Order:", {
    id: cancelledOrder?._id,
    reason: cancelledOrder?.cancelReason,
    status: cancelledOrder?.status,
  });

  console.log("Refunded Order:", {
    id: refundedOrder?._id,
    refundStatus: refundedOrder?.refundStatus,
    refundAmount: refundedOrder?.refundAmount,
    refundId: (refundedOrder as any)?.razorpayRefundId,
  });

  // Support Tickets
  const ticketWithoutOrder = await SupportTicket.findOne({ orderId: { $in: [null, ""] } }).populate("userId").lean();
  const ticketWithOrder = await SupportTicket.findOne({ orderId: { $exists: true, $ne: "" } }).populate("userId").lean();
  console.log("\nTicket without order:", {
    id: ticketWithoutOrder?._id,
    userId: ticketWithoutOrder?.userId,
    userPhone: (ticketWithoutOrder?.userId as any)?.phone,
  });
  console.log("Ticket with order:", {
    id: ticketWithOrder?._id,
    orderId: ticketWithOrder?.orderId,
  });

  // Vendors
  const vendor = await Vendor.findOne().lean();
  console.log("\nVendor sample:", {
    id: vendor?._id,
    name: vendor?.name,
    phone: vendor?.phone,
    hasPassword: !!vendor?.password,
  });

  process.exit(0);
}

findTestOrders().catch(err => {
  console.error(err);
  process.exit(1);
});
