import User, { UserRole } from "./models/User";
import Driver, { DriverStatus } from "./models/Driver";
import Order, { OrderStatus, ServiceType, StopType } from "./models/Order";
import SupportTicket from "./models/SupportTicket";
import AppVersion from "./models/AppVersion";
import Coupon from "./models/Coupon";
import Vendor from "./models/Vendor";
import MeatCenter from "./models/MeatCenter";
import { DayKey, WeeklyHours } from "../utils/openingHours";

const ALL_DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const weeklyHours = (open: string, close: string): WeeklyHours =>
  ALL_DAY_KEYS.reduce((acc, day) => {
    acc[day] = { open, close };
    return acc;
  }, {} as WeeklyHours);

const OPEN_HOURS_LADDER: WeeklyHours[] = [
  weeklyHours("09:00", "23:00"),
  weeklyHours("10:00", "22:30"),
  weeklyHours("11:00", "23:30"),
];

// A breakfast-only window: provably closed at any normal testing hour, so Open-now filtering
// always has something to remove.
const CLOSED_AT_TESTING_HOURS: WeeklyHours = weeklyHours("06:00", "09:00");

// Hours go on the first few outlets only; the last of them always gets the closed window.
const HOURS_SEED_LIMIT = 4;

const hoursFor = (index: number, total: number): WeeklyHours =>
  total > 1 && index === total - 1
    ? CLOSED_AT_TESTING_HOURS
    : OPEN_HOURS_LADDER[index % OPEN_HOURS_LADDER.length];

// Spread across the 3.0+ / 3.5+ / 4.0+ / 4.5+ filter bands, plus an unrated outlet, so every
// rating filter visibly changes the result list. Values are picked evenly across the ladder so
// the spread survives however many vendors exist.
const RATING_LADDER = [4.9, 4.6, 4.3, 4.1, 3.8, 3.6, 3.3, 3.1, 2.4, 0];

// Maps the first vendor to the top of the ladder and the last to the bottom (0), so both ends
// of the 0 - 4.9 range are always represented however many vendors exist.
const ratingFor = (index: number, total: number): number =>
  RATING_LADDER[
    Math.min(
      RATING_LADDER.length - 1,
      Math.round((index * (RATING_LADDER.length - 1)) / Math.max(total - 1, 1)),
    )
  ];

// Minimal food/meat outlets so a completely fresh database still has something for the rating,
// Open-now and coupon filters to act on. Phone numbers sit outside the 98765xxxxx range the
// standalone seed scripts use, so the two never collide.
const DEMO_VENDORS = [
  { name: "Spice Route Kitchen", phone: "9000001001", email: "spiceroute@example.com", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", address: "Kothaguda, Hyderabad", coordinates: [78.3500, 17.4440], categories: ["North Indian", "Biryani"], isPureVeg: false, deliveryFee: 30, minOrderValue: 150 },
  { name: "Green Leaf Tiffins", phone: "9000001002", email: "greenleaf@example.com", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", address: "Kondapur, Hyderabad", coordinates: [78.3450, 17.4500], categories: ["South Indian", "Tiffins"], isPureVeg: true, deliveryFee: 20, minOrderValue: 100 },
  { name: "Grill and Chill", phone: "9000001003", email: "grillchill@example.com", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500", address: "Hitech City Main Rd, Hyderabad", coordinates: [78.3489, 17.4486], categories: ["Burgers", "Beverages"], isPureVeg: false, deliveryFee: 40, minOrderValue: 200 },
  { name: "Sunrise Bakehouse", phone: "9000001004", email: "sunrise@example.com", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", address: "Gachibowli, Hyderabad", coordinates: [78.3520, 17.4400], categories: ["Bakery", "Desserts"], isPureVeg: true, deliveryFee: 25, minOrderValue: 120 },
  { name: "Corner Street Rolls", phone: "9000001005", email: "cornerrolls@example.com", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500", address: "Madhapur, Hyderabad", coordinates: [78.3910, 17.4480], categories: ["Rolls", "Street Food"], isPureVeg: false, deliveryFee: 15, minOrderValue: 80 },
];

const DEMO_MEAT_CENTERS = [
  { name: "Fresh Cuts Meat Centre", phone: "9000002001", email: "freshcuts@example.com", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500", address: "Kothaguda, Hyderabad", coordinates: [78.3495, 17.4450], categories: ["Chicken", "Mutton"], deliveryFee: 30, minOrderValue: 200 },
  { name: "Dawn Meat Mart", phone: "9000002002", email: "dawnmeat@example.com", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500", address: "Kondapur, Hyderabad", coordinates: [78.3460, 17.4490], categories: ["Chicken", "Fish"], deliveryFee: 25, minOrderValue: 150 },
];

export async function seedDatabase() {
  try {
    console.log("Checking database seed requirements...");

    // 1. Ensure at least one USER and one DRIVER exists
    let customer = await User.findOne({ role: UserRole.USER });
    if (!customer) {
      customer = new User({
        name: "Alex Rivera",
        email: "alex@example.com",
        phone: "+15550199",
        password: "password123",
        role: UserRole.USER
      });
      await customer.save();
      console.log("Seeded default Customer user Alex Rivera");
    }

    let driverUser = await User.findOne({ role: UserRole.DRIVER });
    if (!driverUser) {
      driverUser = new User({
        name: "Marcus Rodriguez",
        email: "marcus@example.com",
        phone: "+15550299",
        password: "password123",
        role: UserRole.DRIVER
      });
      await driverUser.save();
      console.log("Seeded default Driver user Marcus Rodriguez");
    }

    let driver = await Driver.findOne({ user: driverUser._id });
    if (!driver) {
      driver = new Driver({
        user: driverUser._id,
        vehicleType: "car",
        vehicleNumber: "CHI-402",
        status: DriverStatus.ONLINE,
        isAvailable: true,
        gender: "male",
        onboardingStatus: "completed"
      });
      await driver.save();
      console.log("Seeded default Driver profile CHI-402");
    }

    // 2. Ensure at least some Orders exist (including completed & multi-stops)
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const order1 = new Order({
        _id: "ORD-9901",
        user: customer._id,
        driver: driver._id,
        status: OrderStatus.DELIVERED,
        serviceType: ServiceType.DELIVERY,
        totalDistance: 12.4,
        totalPrice: 180,
        priceBreakdown: {
          baseFare: 50,
          distanceFare: 100,
          timeFare: 30,
          surgeMultiplier: 1,
          total: 180
        },
        stops: [
          { sequence: 1, type: StopType.PICKUP, address: "Whole Foods Market, Chicago", location: { type: "Point", coordinates: [-87.63, 41.90] } },
          { sequence: 2, type: StopType.DROP, address: "Private Residence, 211 E Ohio St", location: { type: "Point", coordinates: [-87.62, 41.89] } }
        ],
        createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
      });
      await order1.save();

      const order2 = new Order({
        _id: "ORD-9918",
        user: customer._id,
        driver: driver._id,
        status: OrderStatus.DRIVER_ASSIGNED,
        serviceType: ServiceType.DELIVERY,
        totalDistance: 24.5,
        totalPrice: 320,
        priceBreakdown: {
          baseFare: 100,
          distanceFare: 200,
          timeFare: 20,
          surgeMultiplier: 1,
          total: 320
        },
        stops: [
          { sequence: 1, type: StopType.PICKUP, address: "North Star Distribution Center", location: { type: "Point", coordinates: [-87.65, 41.92] } },
          { sequence: 2, type: StopType.STOP, address: "Regional Hub B, Chicago", location: { type: "Point", coordinates: [-87.64, 41.91] } },
          { sequence: 3, type: StopType.DROP, address: "Downtown Retail Hub", location: { type: "Point", coordinates: [-87.63, 41.88] } }
        ],
        createdAt: new Date(Date.now() - 600000) // 10 mins ago
      });
      await order2.save();

      const order3 = new Order({
        _id: "ORD-9921",
        user: customer._id,
        driver: driver._id,
        status: OrderStatus.IN_TRANSIT,
        serviceType: ServiceType.DELIVERY,
        totalDistance: 42.8,
        totalPrice: 580,
        priceBreakdown: {
          baseFare: 150,
          distanceFare: 400,
          timeFare: 30,
          surgeMultiplier: 1,
          total: 580
        },
        stops: [
          { sequence: 1, type: StopType.PICKUP, address: "Port of Chicago, Terminal 4", location: { type: "Point", coordinates: [-87.68, 41.95] } },
          { sequence: 2, type: StopType.STOP, address: "Storage Hub 04", location: { type: "Point", coordinates: [-87.65, 41.93] } },
          { sequence: 3, type: StopType.DROP, address: "Residential Sector D", location: { type: "Point", coordinates: [-87.62, 41.90] } }
        ],
        createdAt: new Date()
      });
      await order3.save();

      console.log("Seeded completed, active, and multi-stop orders successfully");
    }

    // 3. Ensure support tickets exist
    const ticketCount = await SupportTicket.countDocuments();
    if (ticketCount === 0) {
      const tickets = [
        {
          ticketId: "QX-9901",
          title: "Order #ORD-9921 Delay",
          category: "DELAYED DELIVERY",
          status: "OPEN" as const,
          message: '"The driver has been stationary at the harbor for over 3 hours. I need an update on the medical supply shipment..."',
          user: "Alex Rivera",
          time: "2 mins ago",
          messages: [
            { sender: "system" as const, time: "TICKET OPENED • 10:45 AM", text: "Ticket opened" },
            { sender: "user" as const, time: "10:46 AM", text: "I've been monitoring the GPS for Order #ORD-9921. The driver has been at the Terminal 4 gate for 3 hours without moving. This cargo contains temperature-sensitive medical supplies." },
            { sender: "admin" as const, time: "10:48 AM", text: "Hello Alex, I'm checking the gate manifest now. It looks like there's a localized strike at Terminal 4 affecting heavy haulage. Let me contact the fleet lead directly." }
          ]
        },
        {
          ticketId: "QX-9902",
          title: "Billing Discrepancy",
          category: "MULTI-STOP ADJUSTMENT",
          status: "OPEN" as const,
          message: '"The automated billing for the third stop didn\'t include the waiting time surcharge as per our fleet contract."',
          user: "Sarah Jenkins",
          time: "15 mins ago",
          messages: [
            { sender: "system" as const, time: "TICKET OPENED • 10:30 AM", text: "Ticket opened" },
            { sender: "user" as const, time: "10:31 AM", text: "The automated billing for the third stop didn't include the waiting time surcharge as per our fleet contract." }
          ]
        },
        {
          ticketId: "QX-9903",
          title: "Damaged Goods Report",
          category: "QUALITY CONTROL",
          status: "OPEN" as const,
          message: '"Pallet arriving at warehouse B-12 shows signs of water damage. See attached photos for claim."',
          user: "David Chen",
          time: "1 hour ago",
          messages: [
            { sender: "system" as const, time: "TICKET OPENED • 9:45 AM", text: "Ticket opened" },
            { sender: "user" as const, time: "9:46 AM", text: "Pallet arriving at warehouse B-12 shows signs of water damage. See attached photos for claim." }
          ]
        }
      ];

      await SupportTicket.insertMany(tickets);
      console.log("Seeded default SupportTickets successfully");
    }

    // 4. Ensure the version gate is configurable on a fresh DB (both platforms)
    const appVersions = [
      {
        platform: "android",
        latest: "1.0.0",
        minRequired: "0.9.0",
        storeUrl: "https://play.google.com/store/apps/details?id=com.flavour.customer",
      },
      {
        // The iOS id is a placeholder until a real App Store listing exists.
        platform: "ios",
        latest: "1.0.0",
        minRequired: "0.9.0",
        storeUrl: "https://apps.apple.com/app/flavour/id123456",
      },
    ];
    for (const version of appVersions) {
      const existingVersion = await AppVersion.findOne({ platform: version.platform });
      if (!existingVersion) {
        await AppVersion.create(version);
        console.log(`Seeded default AppVersion for ${version.platform}`);
      }
    }

    // 5. Ensure discoverable coupons exist (the offers list is empty without these)
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        { code: "SAVE20", discountType: "PERCENTAGE", discountValue: 20, maxDiscount: 100, minOrderValue: 200, isActive: true },
        { code: "FLAT10", discountType: "FLAT", discountValue: 10, minOrderValue: 0, isActive: true },
      ]);
      console.log("Seeded default Coupons SAVE20 and FLAT10");
    }

    // 6. Ensure there is at least a handful of outlets to filter. Only fires on a completely
    // empty collection, so the standalone restaurant/meat seed scripts always win.
    if (await Vendor.countDocuments() === 0) {
      for (const demo of DEMO_VENDORS) {
        const vendor = new Vendor({
          ...demo,
          password: "vendor123",
          location: { type: "Point", coordinates: demo.coordinates },
          partnerType: "food",
          onboardingStatus: "approved",
          isOpen: true,
        });
        await vendor.save();
      }
      console.log(`Seeded ${DEMO_VENDORS.length} demo Vendors`);
    }

    if (await MeatCenter.countDocuments() === 0) {
      for (const demo of DEMO_MEAT_CENTERS) {
        const meatCenter = new MeatCenter({
          ...demo,
          password: "meat123",
          location: { type: "Point", coordinates: demo.coordinates },
          isOpen: true,
        });
        await meatCenter.save();
      }
      console.log(`Seeded ${DEMO_MEAT_CENTERS.length} demo MeatCenters`);
    }

    // 7. Ensure vendor ratings span every filter band. Only runs when ratings are still
    // uniform (a fresh DB, all at the model default) so curated ratings are never overwritten.
    const vendors = await Vendor.find().sort({ createdAt: 1 });
    if (vendors.length > 1) {
      const distinctRatings = new Set(vendors.map((vendor) => Number(vendor.rating) || 0));
      if (distinctRatings.size <= 1) {
        for (let i = 0; i < vendors.length; i++) {
          await Vendor.updateOne(
            { _id: vendors[i]._id },
            { $set: { rating: ratingFor(i, vendors.length), reviews: String(20 + i * 7) } },
          );
        }
        console.log(`Seeded a 0 - 4.9 rating spread across ${vendors.length} vendors`);
      }
    }

    // 8. Ensure some outlets carry opening hours, including one closed at a typical testing
    // hour, so the Open-now filter has something to remove.
    const vendorsWithHours = await Vendor.countDocuments({ openingHours: { $exists: true, $ne: null } });
    if (vendorsWithHours === 0 && vendors.length > 0) {
      const targets = vendors.slice(0, Math.min(HOURS_SEED_LIMIT, vendors.length));
      for (let i = 0; i < targets.length; i++) {
        await Vendor.updateOne(
          { _id: targets[i]._id },
          { $set: { openingHours: hoursFor(i, targets.length), isManuallyClosed: false } },
        );
      }
      console.log(`Seeded openingHours on ${targets.length} vendors (the last one closed outside breakfast hours)`);
    }

    const meatCentersWithHours = await MeatCenter.countDocuments({ openingHours: { $exists: true, $ne: null } });
    if (meatCentersWithHours === 0) {
      const meatCenters = await MeatCenter.find().sort({ createdAt: 1 }).limit(HOURS_SEED_LIMIT);
      for (let i = 0; i < meatCenters.length; i++) {
        await MeatCenter.updateOne(
          { _id: meatCenters[i]._id },
          { $set: { openingHours: hoursFor(i, meatCenters.length), isManuallyClosed: false } },
        );
      }
      if (meatCenters.length > 0) {
        console.log(`Seeded openingHours on ${meatCenters.length} meat centres (the last one closed outside breakfast hours)`);
      }
    }

    console.log("Seed requirement check complete!");
  } catch (error) {
    console.error("Database seed failed", error);
  }
}
