import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { gunzipSync } from "zlib";
import { writeFileSync } from "fs";
import DeletedAccountArchive from "../database/models/DeletedAccountArchive";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/logistics-platform";

// Writes the safety copy saved by DELETE /users/me to a readable JSON file.
// Usage: npx ts-node src/scripts/export-deleted-account.ts <archiveId | originalUserId | phone>
async function main() {
  const key = process.argv[2];
  if (!key) {
    console.log("Usage: npx ts-node src/scripts/export-deleted-account.ts <archiveId | originalUserId | phone>");
    process.exit(1);
  }

  await mongoose.connect(DATABASE_URL);
  const byId = mongoose.Types.ObjectId.isValid(key) ? [{ _id: key }, { originalUserId: key }] : [];
  const archives = await DeletedAccountArchive.find({ $or: [...byId, { phone: key }] }).sort({ deletedAt: -1 });
  if (archives.length === 0) {
    console.log(`No deleted-account archive found for "${key}".`);
  }

  for (const archive of archives) {
    const file = `deleted-account-${archive.originalUserId}-${archive.deletedAt.getTime()}.json`;
    writeFileSync(file, JSON.stringify(JSON.parse(gunzipSync(archive.snapshot).toString()), null, 2));
    console.log(`${archive.name} (${archive.phone}) deleted ${archive.deletedAt.toISOString()} -> ${file}`, archive.counts);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
