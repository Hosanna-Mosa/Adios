import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Order, { OrderStatus } from "../database/models/Order";
import Driver from "../database/models/Driver";

dotenv.config();

// Deletes every order that is not finished (anything other than completed/delivered/cancelled),
// for all customers and drivers, and frees the drivers those orders were holding.
//
//   npx ts-node src/scripts/clear-ongoing-orders.ts            # dry run: shows what would be deleted
//   npx ts-node src/scripts/clear-ongoing-orders.ts --confirm  # backs up, then deletes
//
// Before deleting, the full order documents are written to ongoing-orders-backup-<timestamp>.json
// in the current directory so they can be restored with mongoimport if needed.

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const FINISHED = [
  OrderStatus.COMPLETED,
  OrderStatus.DELIVERED,
  OrderStatus.DELIVERED_LC,
  OrderStatus.CANCELLED,
];
const confirm = process.argv.includes("--confirm");

function maskedTarget(url: string) {
  return url.replace(/\/\/[^@]*@/, "//***@").replace(/\?.*$/, "");
}

async function clearOngoingOrders() {
  console.log("==================================================");
  console.log(confirm ? "DELETING ONGOING ORDERS" : "DRY RUN (pass --confirm to delete)");
  console.log("Target:", maskedTarget(DATABASE_URL!));
  console.log("==================================================");

  try {
    await mongoose.connect(DATABASE_URL!);
    console.log("Connected to database:", mongoose.connection.name);

    const filter = { status: { $nin: FINISHED } };
    const orders = await Order.find(filter).lean();

    if (orders.length === 0) {
      console.log("No ongoing orders. Nothing to do.");
      return;
    }

    const byStatus: Record<string, number> = {};
    const byService: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      const svc = String((o as any).serviceType ?? "unknown");
      byService[svc] = (byService[svc] || 0) + 1;
    }
    const paidOnline = orders.filter(
      (o: any) => o.paymentMethod === "online" && o.paymentStatus === "paid",
    );
    const driverIds = [
      ...new Set(orders.map((o: any) => o.driver).filter(Boolean).map(String)),
    ];

    console.log(`\nOngoing orders: ${orders.length}`);
    console.log("By status:", byStatus);
    console.log("By service:", byService);
    console.log(`Drivers holding one of these orders: ${driverIds.length}`);
    console.log(
      `Paid online (deleting does NOT refund these): ${paidOnline.length}` +
        (paidOnline.length
          ? "\n  " + paidOnline.map((o: any) => `${o.orderId ?? o._id} ₹${o.totalPrice ?? "?"}`).join("\n  ")
          : ""),
    );

    if (!confirm) {
      console.log("\nDry run only. Re-run with --confirm to back up and delete these orders.");
      return;
    }

    const backupFile = path.resolve(`ongoing-orders-backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(orders, null, 2));
    console.log(`\nBacked up ${orders.length} order(s) to ${backupFile}`);

    // Delete exactly the documents that were backed up, not whatever matches by the time this runs.
    const ids = orders.map((o) => o._id);
    const del = await Order.deleteMany({ _id: { $in: ids } });
    console.log(`Deleted ${del.deletedCount} order(s).`);

    if (driverIds.length) {
      const freed = await Driver.updateMany(
        { _id: { $in: driverIds } },
        { $set: { isAvailable: true } },
      );
      console.log(`Marked ${freed.modifiedCount} driver(s) available again.`);
    }
  } catch (error) {
    console.error("Error while clearing ongoing orders:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

clearOngoingOrders();
