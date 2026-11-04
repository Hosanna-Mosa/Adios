import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Order from "../database/models/Order";
import User from "../database/models/User";
import Vendor from "../database/models/Vendor";
import SupportTicket from "../database/models/SupportTicket";
import ChatMessage from "../database/models/ChatMessage";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/logistics-platform";

async function checkData() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const totalOrders = await Order.countDocuments();
  console.log("Total orders in DB:", totalOrders);

  const orderTypes = await Order.aggregate([
    { $group: { _id: { serviceType: "$serviceType", status: "$status", isPackage: { $cond: [{ $ifNull: ["$packageDelivery", false] }, true, false] } }, count: { $sum: 1 } } }
  ]);
  console.log("Order types breakdown:", JSON.stringify(orderTypes, null, 2));

  const sampleOrders = await Order.find().limit(10).lean();
  for (const o of sampleOrders) {
    console.log(`Order: id=${o._id}, serviceType=${o.serviceType}, status=${o.status}, hasVendor=${!!o.vendor}, hasPackage=${!!o.packageDelivery}, user=${o.user}`);
  }

  const chatCount = await ChatMessage.countDocuments();
  console.log("Chat messages count:", chatCount);

  const ticketCount = await SupportTicket.countDocuments();
  console.log("Support tickets count:", ticketCount);

  const vendors = await Vendor.find().limit(5).lean();
  console.log(`Vendors count: ${vendors.length}`);
  for (const v of vendors) {
    console.log(`Vendor: id=${v._id}, name=${v.name}, phone=${v.phone}`);
  }

  process.exit(0);
}

checkData().catch(err => {
  console.error(err);
  process.exit(1);
});
