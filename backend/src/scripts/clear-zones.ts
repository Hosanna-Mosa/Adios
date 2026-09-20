import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Driver from "../database/models/Driver";
import Zone from "../database/models/Zone";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

async function clearData() {
  console.log("==================================================");
  console.log("🧹 DATABASE ZONE CLEANUP SCRIPT");
  console.log("==================================================");
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(DATABASE_URL!);
    console.log("✅ Connected successfully to MongoDB.");

    // 1. Delete all Zone documents
    console.log("Deleting all Zone documents...");
    const zoneDeleteResult = await Zone.deleteMany({});
    console.log(`✅ Deleted ${zoneDeleteResult.deletedCount} zone(s) from database.`);

    // 2. Clear preferredZone from all Driver documents
    console.log("Clearing preferredZone from all Driver documents...");
    const driverUpdateResult = await Driver.updateMany(
      {},
      { $unset: { preferredZone: 1 } }
    );
    console.log(`✅ Updated ${driverUpdateResult.modifiedCount} driver(s) to remove preferredZone.`);

  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    console.log("==================================================");
  }
}

clearData();
