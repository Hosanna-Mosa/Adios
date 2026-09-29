import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { assignUnownedTickets } from "../services/supportAssignment.service";

dotenv.config();

// One-off: hands out unresolved tickets that predate automatic assignment (or
// whose member no longer exists) using the normal rule. Safe to re-run.
//   npx ts-node src/scripts/assign-support-tickets.ts
const MONGO_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/logistics-platform";

async function run() {
  await mongoose.connect(MONGO_URI);
  const assigned = await assignUnownedTickets();
  console.log(`Assigned ${assigned} unowned support ticket(s).`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Failed to assign support tickets:", error);
  process.exit(1);
});
