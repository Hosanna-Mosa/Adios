// LOCAL TESTING ONLY — refuses to run against anything but a localhost database.
// Creates (or refreshes) one online bike + auto driver at the given point, so the
// customer app's "riders nearby" gate opens on a fresh local DB.
// Usage: npx ts-node --transpile-only src/scripts/local-test-driver.ts <lat> <lng>
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User, { UserRole } from "../database/models/User";
import Driver, { DriverStatus } from "../database/models/Driver";
import { ZonesService } from "../modules/zones/zones.service";

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL || "";
  if (!/^mongodb:\/\/(localhost|127\.0\.0\.1)/.test(url)) throw new Error("Refusing: DATABASE_URL is not a local database");
  const lat = Number(process.argv[2] ?? 17.0005);
  const lng = Number(process.argv[3] ?? 81.7831);
  await mongoose.connect(url);

  const zone = await new ZonesService().getZoneForCoordinates(lat, lng);
  if (!zone) throw new Error("No active zone at that point");

  for (const [phone, vehicleType] of [["9000000101", "bike"], ["9000000102", "auto"]] as const) {
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ name: `Test ${vehicleType} driver`, phone, password: "Test@12345", role: UserRole.DRIVER });
    await Driver.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          status: DriverStatus.ONLINE,
          isAvailable: true,
          vehicleType,
          preferredZone: zone._id,
          currentLocation: { type: "Point", coordinates: [lng, lat] },
        },
      },
      { upsert: true, new: true, strict: false }
    );
    console.log(`online ${vehicleType} driver ${phone} in zone "${zone.name}"`);
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
