import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Banner from "../database/models/Banner";

dotenv.config();

// Turns the "Special Weekend Offer" banner into the Flipkart Big Billion Days ad.
// The customer app opens targetUrl with Linking.openURL, so the https store link
// opens the Flipkart app when it's installed and the browser otherwise.
// imageUrl is left alone: the admin uploads the creative from the Banners page.
//
//   npx ts-node src/scripts/set-flipkart-bbd-banner.ts

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const MATCH = /special weekend offer/i;
const NEXT = {
  title: "Flipkart Big Billion Days",
  description: "Biggest sale of the year — shop now on Flipkart",
  targetUrl: "https://www.flipkart.com/big-billion-days-store",
};

function maskedTarget(url: string) {
  return url.replace(/\/\/[^@]*@/, "//***@").replace(/\?.*$/, "");
}

async function setFlipkartBanner() {
  console.log("Target:", maskedTarget(DATABASE_URL!));
  try {
    await mongoose.connect(DATABASE_URL!);
    console.log("Connected to database:", mongoose.connection.name);

    const banners = await Banner.find({ title: MATCH });
    if (banners.length === 0) {
      const titles = await Banner.find().select("title position isActive").lean();
      console.log(`No banner with a title matching ${MATCH}.`);
      console.log(
        "Existing banners:" +
          (titles.length ? "\n  " + titles.map((b) => `${b._id}  "${b.title}" (${b.position}${b.isActive ? "" : ", inactive"})`).join("\n  ") : " none")
      );
      console.log("Hint: rename the banner you want to repurpose to \"Special Weekend Offer\" and re-run, or edit it on the admin Banners page.");
      return;
    }

    for (const banner of banners) {
      const before = { title: banner.title, description: banner.description, targetUrl: banner.targetUrl };
      banner.title = NEXT.title;
      banner.description = NEXT.description;
      banner.targetUrl = NEXT.targetUrl;
      await banner.save();
      console.log(`\nUpdated banner ${banner._id} (${banner.position}, ${banner.itemType}):`);
      for (const key of Object.keys(NEXT) as (keyof typeof NEXT)[]) {
        console.log(`  ${key}: ${JSON.stringify(before[key] ?? null)} -> ${JSON.stringify(NEXT[key])}`);
      }
      console.log(`  imageUrl (unchanged): ${banner.imageUrl}`);
    }
    console.log(`\nDone — ${banners.length} banner(s) updated. Upload the BBD creative from the admin Banners page.`);
  } catch (error) {
    console.error("Failed to update banner:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setFlipkartBanner();
