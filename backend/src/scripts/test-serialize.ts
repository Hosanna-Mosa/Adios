import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { ZonesService } from "../modules/zones/zones.service";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

async function testSerialize() {
  await mongoose.connect(DATABASE_URL!);
  console.log("Connected to MongoDB");

  const zonesService = new ZonesService();
  const zone = await zonesService.getZoneForCoordinates(17.0005, 81.7840);
  
  if (!zone) {
    console.log("No zone matched");
  } else {
    console.log("Zone found:", zone.name);
    try {
      console.log("Attempting to JSON.stringify the zone document directly...");
      const serialized = JSON.stringify(zone);
      console.log("Success! Serialized length:", serialized.length);
      
      console.log("Attempting to JSON.stringify the response object...");
      const responseObj = {
        success: true,
        inZone: true,
        zone: zone,
        pricingMultiplier: zone.pricingMultiplier
      };
      const serializedResponseObj = JSON.stringify(responseObj);
      console.log("Success! Serialized response object length:", serializedResponseObj.length);
    } catch (error: any) {
      console.error("Serialization failed:", error.stack);
    }
  }

  await mongoose.disconnect();
}

testSerialize();
