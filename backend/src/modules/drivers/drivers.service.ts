import mongoose from "mongoose";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus, StopType } from "../../database/models/Order";
import { getDriverRating } from "../reviews/driver-rating";
import { getDispatchStagesForVehicle, mapServiceTypeToDriverVehicleType, driverAcceptsServiceType } from "../../config/dispatch.config";
import DriverPayout, { DriverPayoutStatus } from "../../database/models/DriverPayout";
import User from "../../database/models/User";
import Zone from "../../database/models/Zone";
import { PaymentService } from "../payments/payment.service";
import { RazorpayXError } from "../payments/razorpayx.client";
import { applyRazorpayXPayout, syncOpenPayouts } from "../payments/payout.status";
import { SocketManager } from "../../sockets/socket.manager";
import { ZonesService } from "../zones/zones.service";
import { NotificationService } from "../../services/notification.service";

export interface HighDemandArea {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  orderCount: number;
  surgeMultiplier: number;
  surge: string;
}

export class DriverService {
  private paymentService = new PaymentService();

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * (Math.PI / 180);
    const phi2 = lat2 * (Math.PI / 180);
    const deltaPhi = (lat2 - lat1) * (Math.PI / 180);
    const deltaLambda = (lng2 - lng1) * (Math.PI / 180);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  }

  private getLocationMaxAgeMs(): number {
    const raw = process.env.DRIVER_LOCATION_MAX_AGE_MS;
    if (raw !== undefined && raw.trim() !== "") {
      const configured = Number(raw);
      if (Number.isFinite(configured) && configured >= 0) return configured;
    }
    return 15 * 60 * 1000;
  }

  // Public wrapper so other call sites that build their own ad-hoc "online driver"
  // queries (see OrdersService.createOrder / increasePrice fallbacks) can apply the
  // exact same staleness rule getNearbyDrivers uses, instead of drifting out of sync
  // with it. Those fallbacks exist specifically to reach a driver when the normal
  // zone/proximity search comes up empty — if they then hand a phantom "ONLINE" driver
  // (app closed, GPS fix minutes/hours old) to the dispatcher, the offer silently times
  // out after the full per-driver wait, which is exactly what "ride never reaches a
  // driver" looks like from the customer's side.
  public filterDriversWithLiveLocation(drivers: any[], source = "fallback"): any[] {
    const maxAgeMs = this.getLocationMaxAgeMs();
    const live = drivers.filter((d) => this.hasLiveLocation(d, maxAgeMs));
    const dropped = drivers.length - live.length;
    if (dropped > 0) {
      console.log(`🕒 [STALE LOCATION - ${source}] Skipped ${dropped} driver(s) with no recent GPS fix.`);
    }
    return live;
  }

  // A driver whose GPS fix is missing or stale is not reachable, so it must not be
  // reported as an available captain even when the DB still says ONLINE.
  private hasLiveLocation(driver: any, maxAgeMs: number): boolean {
    const coords = driver?.currentLocation?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return false;

    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
    if (lng === 0 && lat === 0) return false; // schema default: never reported a fix

    if (maxAgeMs === 0) return true; // freshness check disabled

    const lastUpdate = driver?.updatedAt ? new Date(driver.updatedAt).getTime() : NaN;
    if (!Number.isFinite(lastUpdate)) return false;

    return Date.now() - lastUpdate <= maxAgeMs;
  }

  async getNearbyDrivers(lat: number, lng: number, radiusInMeters?: number, vehicleType?: string, requireOnline: boolean = false) {
    const socketManager = SocketManager.getInstance();
    const redisClient = socketManager ? (socketManager as any).redisClient : null;

    // Fetch all zones into a quick name-lookup map
    let zoneMap = new Map<string, string>();
    try {
      const allZones = await Zone.find().lean();
      allZones.forEach(z => zoneMap.set(z._id.toString(), z.name));
    } catch (zErr: any) {
      console.error("Error building zone map for logging:", zErr.message);
    }

    // Zone Serviceability Check
    const zonesService = new ZonesService();
    const activeZone = await zonesService.getZoneForCoordinates(lat, lng);
    if (!activeZone) {
      console.log(`\n============================================================`);
      console.log(`⚠️ [ZONE CHECK] Coordinates [lat: ${lat}, lng: ${lng}] are OUTSIDE all active zones.`);
      console.log("============================================================\n");
      return [];
    }

    console.log("\n============================================================");
    console.log(`📍 [DRIVER SEARCH] Pickup Coordinates: [lat: ${lat}, lng: ${lng}] | Zone: "${activeZone.name}" | requireOnline: ${requireOnline}`);

    try {
      const allOnlineDrivers = await Driver.find({ status: DriverStatus.ONLINE }).populate("user");
      console.log(`🟢 ONLINE DRIVERS AVAILABLE IN BACKEND: ${allOnlineDrivers.length}`);
      allOnlineDrivers.forEach(d => {
        const userName = (d.user as any)?.name || "Unknown";
        const userPhone = (d.user as any)?.phone || "No Phone";
        const driverZoneName = d.preferredZone ? (zoneMap.get(d.preferredZone.toString()) || "Unknown Zone") : "No Zone Assigned";
        console.log(`   🚗 Driver: ${userName} (${userPhone}) | ID: ${d._id} | Vehicle: ${d.vehicleType || "N/A"} | Zone: "${driverZoneName}"`);
      });
    } catch (err: any) {
      console.error("Error querying online drivers for logging:", err.message);
    }
    console.log("============================================================\n");

    // Retrieve vehicle-specific 3-stage expansion configuration
    const stages = getDispatchStagesForVehicle(vehicleType);

    // The caller passes the raw ServiceType enum value ("BIKE", "AUTO", ...),
    // uppercase, while Driver.vehicleType is stored lowercase ("bike", "auto").
    // Every vehicleType check below used to compare the raw value directly, so
    // ["bike","auto",...].includes("BIKE") was always false and the whole
    // vehicle filter silently never applied — a bike ride and an auto ride
    // matched exactly the same (unfiltered) candidate pool, so either could be
    // offered to a driver with the wrong vehicle. Normalized once here; every
    // vehicleType reference below uses this instead of the raw parameter.
    const normalizedVehicleType = vehicleType?.toLowerCase();
    // The actual value to filter Driver.vehicleType by — NOT the same as
    // normalizedVehicleType. See mapServiceTypeToDriverVehicleType: "cab" and
    // "cab_prime" don't exist on Driver.vehicleType (only "bike"|"auto"|"car"
    // do), so filtering on the raw ride tier matched zero drivers, always.
    // undefined here means "don't filter by vehicle" (helper/delivery orders).
    const driverVehicleTypeFilter = mapServiceTypeToDriverVehicleType(normalizedVehicleType);

    // Every lookup below must honour requireOnline, otherwise off-shift drivers come back
    // as available captains.
    const onlineFilter: any = requireOnline ? { status: DriverStatus.ONLINE, isAvailable: true } : {};
    const locationMaxAgeMs = this.getLocationMaxAgeMs();
    const filterAvailable = (drivers: any[], source: string): any[] => {
      if (!requireOnline) return drivers;
      const live = drivers.filter((d) => this.hasLiveLocation(d, locationMaxAgeMs));
      const dropped = drivers.length - live.length;
      if (dropped > 0) {
        console.log(`🕒 [STALE LOCATION - ${source}] Skipped ${dropped} driver(s) with no recent GPS fix.`);
      }
      // A driver who hasn't toggled this order's category on (see GoOnlineModal)
      // would just have the offer silently dropped by their own app — no modal,
      // no decline call — so the dispatcher would burn the full per-driver offer
      // timeout waiting on someone who could never respond. Exclude them here so
      // the cascade reaches someone who actually can.
      const reachable = live.filter((d) => driverAcceptsServiceType(d.activeServices, vehicleType));
      const excludedByService = live.length - reachable.length;
      if (excludedByService > 0) {
        console.log(`🙅 [SERVICE TOGGLE OFF - ${source}] Skipped ${excludedByService} driver(s) not opted into this order's category.`);
      }
      return reachable;
    };

    let results: any[] = [];
    let matchedStageName = "";

    for (const stage of stages) {
      const currentRadius = radiusInMeters && radiusInMeters > stage.radiusMeters ? radiusInMeters : stage.radiusMeters;
      console.log(`🔍 [DYNAMIC DISPATCH - ${stage.name}] Searching within ${currentRadius}m radius...`);

      let stageDrivers: any[] = [];

      // 1. Redis lookup
      if (redisClient && redisClient.isReady) {
        try {
          const nearbyDriverIds = await redisClient.geoSearch("drivers:locations",
            { longitude: lng, latitude: lat },
            { radius: currentRadius, unit: "m" }
          );

          if (nearbyDriverIds && nearbyDriverIds.length > 0) {
            const validObjectIds = nearbyDriverIds.filter((id: any) => mongoose.Types.ObjectId.isValid(id));
            const query: any = {
              _id: { $in: validObjectIds },
              preferredZone: activeZone._id,
              ...onlineFilter,
            };
            if (driverVehicleTypeFilter) {
              query.vehicleType = driverVehicleTypeFilter;
            }
            const drivers = await Driver.find(query).populate("user");
            const driverMap = new Map(drivers.map((d: any) => [d._id.toString(), d]));
            stageDrivers = nearbyDriverIds
              .map((id: any) => driverMap.get(id))
              .filter(Boolean);
          }
        } catch (err: any) {
          console.warn(`[REDIS] geoSearch failed for ${stage.name}, using MongoDB:`, err.message);
        }
      }

      // 2. MongoDB Proximity Query Fallback
      if (stageDrivers.length === 0) {
        const query: any = {
          preferredZone: activeZone._id,
          ...onlineFilter,
          currentLocation: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [lng, lat],
              },
              $maxDistance: currentRadius,
            },
          },
        };

        if (driverVehicleTypeFilter) {
          // If it's a ride order, we MUST filter by vehicle type
          query.vehicleType = driverVehicleTypeFilter;
        }

        try {
          stageDrivers = await Driver.find(query).populate("user");
        } catch (mErr: any) {
          console.error(`MongoDB geoQuery failed for ${stage.name}:`, mErr.message);
        }
      }

      // Include dev check drivers for testing
      try {
        const devUsers = await User.find({ name: /^check\d+$/i });
        const devUserIds = devUsers.map(u => u._id);
        const devDriversQuery: any = {
          user: { $in: devUserIds },
          ...onlineFilter,
        };
        if (driverVehicleTypeFilter) {
          devDriversQuery.vehicleType = driverVehicleTypeFilter;
        }
        // Dev drivers CAN receive helper/delivery tasks during local testing —
        // driverVehicleTypeFilter is undefined for those, so no filter is applied.
        const devDrivers = await Driver.find(devDriversQuery).populate("user");
        for (const dd of devDrivers) {
          if (!stageDrivers.some(d => d._id.toString() === dd._id.toString())) {
            stageDrivers.push(dd);
          }
        }
      } catch (devErr) {
        console.warn("[DEV DRIVERS SEARCH FETCH] Error loading dev drivers:", devErr);
      }

      stageDrivers = filterAvailable(stageDrivers, stage.name);

      if (stageDrivers.length > 0) {
        results = stageDrivers;
        matchedStageName = stage.name;
        console.log(`✅ [DISPATCH MATCH - ${stage.name}] Found ${results.length} driver(s)! Stopping expansion.`);
        break; // Drivers found! Stop further expansion.
      } else {
        console.log(`⚠️ [DISPATCH EXPANSION - ${stage.name}] 0 drivers found within ${currentRadius}m. Expanding to next stage...`);
      }
    }

    // 3. Ultimate Fallback: Check if ANY driver exists in DB for this activeZone (online or offline)
    if (results.length === 0) {
      try {
        const zoneDriversQuery: any = {
          $or: [
            { preferredZone: activeZone._id },
            { preferredZones: activeZone._id }
          ]
        };
        if (requireOnline) {
          zoneDriversQuery.status = DriverStatus.ONLINE;
          zoneDriversQuery.isAvailable = true;
        }
        if (driverVehicleTypeFilter) {
          zoneDriversQuery.vehicleType = driverVehicleTypeFilter;
        }
        const zoneDrivers = filterAvailable(await Driver.find(zoneDriversQuery).populate("user"), "Zone DB Fallback");
        if (zoneDrivers.length > 0) {
          results = zoneDrivers;
          matchedStageName = "Zone DB Fallback";
          console.log(`✅ [ZONE DB MATCH] Found ${results.length} driver(s) registered for zone "${activeZone.name}".`);
        }
      } catch (zQueryErr: any) {
        console.error("Error checking zone drivers fallback:", zQueryErr.message);
      }
    }

    console.log(`[DRIVER SEARCH FINAL] Matched: ${results.length} driver(s) via ${matchedStageName || "No Stage Match"}`);
    results.forEach((d) => {
      console.log(` -> Matched Driver: ${d._id}, Name: ${d.user?.name}, Phone: ${d.user?.phone}, vehicleType: ${d.vehicleType}, status: ${d.status}`);
    });

    return results;
  }

  async updateLocation(driverId: string, lat: number, lng: number) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error("Driver not found");

    driver.currentLocation = {
      type: "Point",
      coordinates: [lng, lat],
    };

    if (driver.status === DriverStatus.ONLINE) {
      driver.isAvailable = true;
    }

    try {
      const { ZonesService } = require("../zones/zones.service");
      const zonesService = new ZonesService();
      const activeZone = await zonesService.getZoneForCoordinates(lat, lng);
      if (activeZone && !driver.preferredZone) {
        driver.preferredZone = activeZone._id;
      }
    } catch (zoneErr) {
      console.warn("[HTTP LOCATION UPDATE] Error resolving zone for driver:", zoneErr);
    }

    const savedDriver = await driver.save();

    // Sync Redis if online
    try {
      const { socketManager } = require("../../sockets/socket.manager");
      const redisClient = socketManager ? socketManager.redisClient : null;
      if (redisClient && redisClient.isReady && driver.status === DriverStatus.ONLINE) {
        await redisClient.geoAdd("drivers:locations", {
          longitude: Number(lng),
          latitude: Number(lat),
          member: driver._id.toString()
        });
        await redisClient.set(`driver_status:${driver._id.toString()}`, "online", { EX: 60 });
      }
    } catch (redisErr: any) {
      console.warn("[HTTP LOCATION UPDATE] Failed to sync Redis:", redisErr.message);
    }

    return savedDriver;
  }

  async updateStatus(driverId: string, status: DriverStatus, activeServices?: ("ride" | "food")[]) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error("Driver not found");

    driver.status = status;
    if (status === DriverStatus.ONLINE) {
      driver.isAvailable = true;
      // Only overwrite when the caller actually sent a selection (going ONLINE
      // from the app does). Going OFFLINE has no reason to send one, and an
      // empty/undefined value here must not erase what the driver last chose —
      // see driverAcceptsServiceType's "no filter" fallback for what an empty
      // list would otherwise do to every future dispatch for this driver.
      if (activeServices && activeServices.length > 0) {
        driver.activeServices = activeServices;
      }
    }
    return driver.save();
  }

  async updateHomeMode(driverId: string, homeMode: boolean) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error("Driver not found");

    driver.homeMode = homeMode;
    return driver.save();
  }

  async isOrderOnTheWayToHome(driverId: string, orderPickupCoords: number[], orderDropoffCoords: number[]): Promise<boolean> {
    const driver = await Driver.findById(driverId).populate("user");
    if (!driver || !driver.user) return false;

    const user = driver.user as any;
    const homeAddress = user.addresses?.find(
      (addr: any) => addr.label && addr.label.trim().toLowerCase() === "home"
    );

    if (!homeAddress || !homeAddress.location?.coordinates || homeAddress.location.coordinates.length < 2) {
      return false;
    }

    const driverCoords = driver.currentLocation?.coordinates;
    if (!driverCoords || driverCoords.length < 2) return false;

    const driverLng = driverCoords[0];
    const driverLat = driverCoords[1];
    const homeLng = homeAddress.location.coordinates[0];
    const homeLat = homeAddress.location.coordinates[1];
    const pickupLng = orderPickupCoords[0];
    const pickupLat = orderPickupCoords[1];
    const dropoffLng = orderDropoffCoords[0];
    const dropoffLat = orderDropoffCoords[1];

    const d_h = this.haversineDistance(driverLat, driverLng, homeLat, homeLng);
    const d_p = this.haversineDistance(driverLat, driverLng, pickupLat, pickupLng);
    const p_d = this.haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const drop_h = this.haversineDistance(dropoffLat, dropoffLng, homeLat, homeLng);

    // Diagnostics go to the app log. This used to fs.appendFileSync a debug.log on
    // every candidate of every dispatch — a synchronous disk write in the hot path
    // that throws outright on a read-only filesystem, and the caller does not guard
    // the call, so one failed write could take down a whole booking.
    const trace = (outcome: string) =>
      console.log(
        `[DETOUR CHECK] driver=${driverId} d_h=${d_h.toFixed(0)}m d_p=${d_p.toFixed(0)}m ` +
        `p_d=${p_d.toFixed(0)}m drop_h=${drop_h.toFixed(0)}m -> ${outcome}`
      );

    if (d_h < 3000) {
      trace("MATCHED (driver already within 3km of home)");
      return true;
    }

    // A task with no distinct destination — a helper job booked without a drop-off
    // is the only order shape that produces this — has nothing to detour *towards*.
    // stops[0] and stops[last] are then the same stop, so "dropoff" is really just
    // the pickup, and the drop_h >= d_h test below reads a job near the customer as
    // a drive away from home and rejects it. Judge those on the trip out only.
    const hasDistinctDropoff = p_d > 1;
    if (!hasDistinctDropoff) {
      const detourOut = d_p - d_h;
      const allowedOut = Math.max(10000, 0.3 * d_h);
      const okOut = detourOut <= allowedOut;
      trace(`single-location task, out-leg detour ${detourOut.toFixed(0)}m vs ${allowedOut.toFixed(0)}m -> ${okOut}`);
      return okOut;
    }

    if (drop_h >= d_h) {
      trace(`FILTERED OUT (dropoff further from home than driver: ${drop_h.toFixed(0)}m >= ${d_h.toFixed(0)}m)`);
      return false;
    }

    const detourOverhead = (d_p + p_d + drop_h) - d_h;
    const maxAllowedDetour = Math.max(10000, 0.3 * d_h);
    const result = detourOverhead <= maxAllowedDetour;
    trace(`detour ${detourOverhead.toFixed(0)}m vs max ${maxAllowedDetour.toFixed(0)}m -> ${result}`);
    return result;
  }

  async getHighDemandAreas(limit: number = 6): Promise<HighDemandArea[]> {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const activeDemandStatuses = [
      OrderStatus.CREATED,
      OrderStatus.SEARCHING_DRIVER,
      OrderStatus.CONFIRMED,
    ];

    const areas = await Order.aggregate<{
      _id: string;
      address: string;
      lat: number;
      lng: number;
      orderCount: number;
    }>([
      {
        $match: {
          createdAt: { $gte: since },
          status: { $in: activeDemandStatuses },
        },
      },
      { $unwind: "$stops" },
      {
        $match: {
          "stops.type": { $in: [StopType.PICKUP, StopType.DROP] },
          "stops.address": { $type: "string", $ne: "" },
          "stops.location.coordinates.0": { $type: "number" },
          "stops.location.coordinates.1": { $type: "number" },
        },
      },
      {
        $addFields: {
          areaName: {
            $trim: {
              input: {
                $arrayElemAt: [{ $split: ["$stops.address", ","] }, 0],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: { $toLower: "$areaName" },
          address: { $first: "$stops.address" },
          lat: { $avg: { $arrayElemAt: ["$stops.location.coordinates", 1] } },
          lng: { $avg: { $arrayElemAt: ["$stops.location.coordinates", 0] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: Math.max(1, Math.min(limit, 10)) },
    ]);

    return areas.map((area, index) => {
      const surgeMultiplier = Math.min(2, 1 + area.orderCount * 0.1);

      return {
        id: `${area._id}-${index}`,
        name: this.getAreaName(area.address),
        address: area.address,
        lat: Number(area.lat.toFixed(6)),
        lng: Number(area.lng.toFixed(6)),
        orderCount: area.orderCount,
        surgeMultiplier,
        surge: `${surgeMultiplier.toFixed(1)}x Surge`,
      };
    });
  }

  private getAreaName(address: string) {
    return address
      .split(",")[0]
      .replace(/\s+/g, " ")
      .trim();
  }

  async getProfile(userId: string) {
    const [user, driver] = await Promise.all([
      User.findById(userId).lean(),
      Driver.findOne({ user: userId }).lean(),
    ]);

    if (!user) throw new Error("User not found");

    const completedTrips = driver
      ? await Order.countDocuments({
          driver: driver._id,
          status: { $in: this.completedStatuses() },
        })
      : 0;

    // Reuses the same aggregation the customer-facing tracking screen already
    // relies on for a driver's rating, rather than reimplementing it here — this
    // used to be a flat 4.9 for every driver regardless of actual feedback.
    const { rating, ratingCount } = driver
      ? await getDriverRating(driver._id)
      : { rating: null, ratingCount: 0 };

    return {
      account: {
        id: user._id.toString(),
        name: user.name,
        username: user.username || null,
        email: user.email || null,
        phone: user.phone,
        profilePic: user.profilePic || null,
        role: user.role,
        defaultLocation: user.defaultLocation || null,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      driver: driver
        ? {
            id: driver._id.toString(),
            status: driver.status,
            isAvailable: driver.isAvailable,
            currentLocation: driver.currentLocation || null,
            onboardingStatus: driver.onboardingStatus,
            onboardingCompletedAt: driver.onboardingCompletedAt || null,
            gender: driver.gender || null,
            vehicleType: driver.vehicleType || null,
            aadhaarNumber: this.maskValue(driver.aadhaarNumber, 4),
            aadhaarVerified: Boolean(driver.aadhaarVerified),
            panNumber: this.maskValue(driver.panNumber, 4),
            panImage: driver.panImage || null,
            dlNumber: this.maskValue(driver.dlNumber, 4),
            dlExpiry: driver.dlExpiry || null,
            dlFrontImage: driver.dlFrontImage || null,
            dlBackImage: driver.dlBackImage || null,
            bankAccountNumber: this.maskValue(driver.bankAccountNumber, 4),
            bankIfsc: driver.bankIfsc || null,
            bankVerified: Boolean(driver.bankVerified),
            bankAccounts: (driver.bankAccounts || []).map((ba: any) => ({
              accountNumber: this.maskValue(ba.accountNumber, 4),
              ifsc: ba.ifsc,
              verified: Boolean(ba.verified),
              isDefault: Boolean(ba.isDefault),
            })),
            selfieImage: driver.selfieImage || null,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt,
          }
        : null,
      verification: {
        identity: Boolean(driver?.aadhaarVerified || driver?.panNumber),
        drivingLicense: this.getLicenseStatus(driver?.dlExpiry),
        bank: Boolean(driver?.bankVerified),
        selfie: Boolean(driver?.selfieImage),
        documentsComplete: Boolean(
          driver?.vehicleType &&
          (driver.aadhaarVerified || driver.panNumber) &&
          driver.dlNumber &&
          driver.bankVerified,
        ),
      },
      vehicle: {
        type: driver?.vehicleType || null,
        label: this.formatVehicleType(driver?.vehicleType),
        insuranceStatus: driver?.vehicleType ? "valid" : "pending",
      },
      stats: {
        completedTrips,
        rating,
        ratingCount,
        acceptanceRate: 98,
      },
    };
  }

  async getEarnings(userId: string) {
    const driver = await Driver.findOne({ user: userId });
    if (!driver) throw new Error("Driver profile not found");

    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Pick up payouts whose webhook was missed, so the balance and history reflect RazorpayX.
    await syncOpenPayouts("driver", { driver: driver._id }).catch((err) =>
      console.warn("[drivers.service] Payout refresh failed:", err?.message),
    );

    const [weekOrders, previousWeekOrders, todayOrders, allCompletedOrders, payouts] = await Promise.all([
      this.getCompletedOrdersForDriver(driver._id, weekStart, now),
      this.getCompletedOrdersForDriver(driver._id, previousWeekStart, weekStart),
      this.getCompletedOrdersForDriver(driver._id, todayStart, now),
      Order.find({
        driver: driver._id,
        status: { $in: this.completedStatuses() },
      }).sort({ updatedAt: -1 }).limit(20),
      DriverPayout.find({ driver: driver._id }).sort({ createdAt: -1 }).limit(10),
    ]);

    const weeklyBreakdown = this.buildWeeklyBreakdown(weekOrders, weekStart);
    const weekGross = this.sumDriverEarnings(weekOrders);
    const previousWeekGross = this.sumDriverEarnings(previousWeekOrders);
    const todayGross = this.sumDriverEarnings(todayOrders);
    const paidOut = await this.getPaidOutTotal(driver._id);
    const { lifetimeGross, cashCollectedTotal } = await this.getLifetimeGross(driver._id);
    // Withdrawable = earned share − cash the driver already holds − payouts reserved/sent.
    // A cash order puts the whole fare in the driver's hand, so it adds (share − cash), i.e.
    // it reduces the balance by the platform's commission the driver now owes.
    const netBalance = lifetimeGross - cashCollectedTotal - paidOut;
    const availableBalance = Math.max(0, netBalance);
    const cashCommissionDue = Math.max(0, -netBalance);
    const trendPercent = previousWeekGross > 0
      ? Math.round(((weekGross - previousWeekGross) / previousWeekGross) * 100)
      : weekGross > 0 ? 100 : 0;

    const recentActivity = [
      ...allCompletedOrders.map((order: any) => ({
        id: order._id.toString(),
        type: "earning",
        icon: order.serviceType === "delivery" || order.serviceType === "helper" ? "package" : "car",
        label: `${this.formatServiceLabel(order.serviceType)} - ${this.getOrderDestination(order)}`,
        amount: Math.round((order.totalPrice || 0) * 0.8),
        paymentMethod: order.paymentMethod,
        cashCollectedAmount: order.cashCollected ? order.cashCollectedAmount : undefined,
        createdAt: order.updatedAt || order.createdAt,
      })),
      ...payouts.map((payout: any) => ({
        id: payout._id.toString(),
        type: "payout",
        icon: "credit-card",
        label: `Cash out - ${payout.status}`,
        amount: -payout.amount,
        createdAt: payout.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      availableBalance,
      cashCollectedTotal,
      cashCommissionDue,
      weekBalance: weekGross,
      // "Today" was previously missing entirely — the home screen's "Today's
      // Performance" card had to substitute the lifetime available balance and a
      // weekly trip count in its place, which is why they never matched the
      // selected time range.
      todayBalance: todayGross,
      trendPercent,
      weeklyBreakdown,
      recentActivity,
      stats: {
        onlineHours: this.estimateActiveHours(weekOrders),
        totalDistance: Math.round(weekOrders.reduce((sum: number, order: any) => sum + (order.totalDistance || 0), 0)),
        completedTrips: weekOrders.length,
        completedTripsToday: todayOrders.length,
      },
      bank: {
        verified: Boolean(driver.bankVerified),
        last4: driver.bankAccountNumber?.slice(-4) || null,
        ifsc: driver.bankIfsc || null,
      },
    };
  }

  async cashOut(userId: string, password: string, amount?: number) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const isPasswordValid = user.password ? await user.matchPassword(password) : false;
    if (!isPasswordValid) throw new Error("Invalid driver credentials");

    const driver = await Driver.findOne({ user: userId });
    if (!driver) throw new Error("Driver profile not found");
    if (!driver.bankVerified || !driver.bankAccountNumber || !driver.bankIfsc) {
      throw new Error("Verified bank account is required before cash out");
    }

    // Only one cash-out at a time per driver, so two taps can't both pass the balance check.
    const now = new Date();
    const locked = await Driver.findOneAndUpdate(
      { _id: driver._id, $or: [{ payoutLockUntil: null }, { payoutLockUntil: { $exists: false } }, { payoutLockUntil: { $lt: now } }] },
      { $set: { payoutLockUntil: new Date(now.getTime() + 60_000) } },
    );
    if (!locked) throw new Error("A cash out is already being processed. Please wait a moment.");

    let payoutRecord;
    try {
      const earnings = await this.getEarnings(userId);
      const payoutAmount = amount && amount > 0 ? amount : earnings.availableBalance;

      if (payoutAmount < 100) {
        throw new Error("Minimum cash out amount is Rs.100");
      }
      if (payoutAmount > earnings.availableBalance) {
        throw new Error("Cash out amount exceeds available balance");
      }

      // "pending" = requested. It already counts against the balance (getPaidOutTotal), so the
      // amount stays reserved until RazorpayX processes it or it fails.
      payoutRecord = await DriverPayout.create({
        driver: driver._id,
        user: user._id,
        amount: payoutAmount,
        status: DriverPayoutStatus.PENDING,
      });
    } finally {
      await Driver.updateOne({ _id: driver._id }, { $set: { payoutLockUntil: null } });
    }

    const recordId = payoutRecord._id.toString();
    let result: Awaited<ReturnType<PaymentService["createDriverPayout"]>> = null;
    try {
      result = await this.paymentService.createDriverPayout({
        referenceId: recordId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        accountNumber: driver.bankAccountNumber,
        ifsc: driver.bankIfsc,
        amount: payoutRecord.amount,
        notes: { driverId: driver._id.toString(), payoutRecordId: recordId },
      });
    } catch (error: any) {
      const outcomeUnknown = error instanceof RazorpayXError && error.stage === "payout" && !error.definitive;
      if (outcomeUnknown) {
        // RazorpayX may have created it. Keep the amount reserved; the webhook (matched by
        // reference_id) settles it. Never report this as paid or as failed.
        await DriverPayout.updateOne(
          { _id: recordId, status: DriverPayoutStatus.PENDING },
          { $set: { status: DriverPayoutStatus.PROCESSING, failureReason: "Awaiting confirmation from RazorpayX" } },
        );
        console.error(`[drivers.service] ALERT payout ${recordId} outcome unknown:`, error.message);
      } else {
        // No payout exists at RazorpayX: release the amount back to the balance.
        await DriverPayout.updateOne(
          { _id: recordId, status: DriverPayoutStatus.PENDING },
          { $set: { status: DriverPayoutStatus.FAILED, failureReason: error.message } },
        );
        throw error;
      }
    }

    if (result) {
      await DriverPayout.updateOne(
        { _id: recordId },
        { $set: { razorpayContactId: result.contact.id, razorpayFundAccountId: result.fundAccount.id } },
      );
      await applyRazorpayXPayout("driver", recordId, result.payout);
    }

    const saved = await DriverPayout.findById(recordId);
    const status = saved?.status ?? DriverPayoutStatus.PENDING;
    if (status === DriverPayoutStatus.FAILED) {
      throw new Error(saved?.failureReason || "Payout failed");
    }

    // Tell the truth about where the money is. "processed" is only ever set from RazorpayX's
    // answer, and applyRazorpayXPayout already notified the driver in that case.
    if (status !== DriverPayoutStatus.PROCESSED) {
      NotificationService.getInstance()
        .sendNotification({
          userId: user._id.toString(),
          title: "Payout requested",
          body:
            status === DriverPayoutStatus.PROCESSING
              ? `Your ₹${payoutRecord.amount} payout has been sent to the bank for processing. We'll notify you once it's credited.`
              : `Your ₹${payoutRecord.amount} payout request is recorded. We'll notify you once it's processed.`,
          type: "transactional",
          category: "system",
          data: { deepLink: { screen: "/(tabs)/earnings" } },
        })
        .catch((err) => console.error("[drivers.service] Failed to send payout notification:", err));
    }

    return {
      message:
        status === DriverPayoutStatus.PROCESSED ? "Payout processed"
        : status === DriverPayoutStatus.PROCESSING ? "Payout is being processed"
        : "Payout requested",
      payout: {
        id: recordId,
        razorpayPayoutId: saved?.razorpayPayoutId,
        amount: payoutRecord.amount,
        status,
      },
    };
  }

  private completedStatuses() {
    return [OrderStatus.COMPLETED, OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC];
  }

  private getCompletedOrdersForDriver(driverId: any, from: Date, to: Date) {
    return Order.find({
      driver: driverId,
      status: { $in: this.completedStatuses() },
      updatedAt: { $gte: from, $lt: to },
    });
  }

  /**
   * The driver's share of completed orders (unchanged 80% rule), plus the cash the driver
   * confirmed collecting for cash orders. Only cash confirmed through POST
   * /orders/:id/cash-collected counts; older orders without that record are unchanged.
   */
  private async getLifetimeGross(driverId: any) {
    const result = await Order.aggregate<{ total: number; cash: number }>([
      { $match: { driver: driverId, status: { $in: this.completedStatuses() } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$totalPrice", 0.8] } },
          cash: { $sum: { $cond: [{ $eq: ["$cashCollected", true] }, { $ifNull: ["$cashCollectedAmount", 0] }, 0] } },
        },
      },
    ]);

    return {
      lifetimeGross: Math.round(result[0]?.total || 0),
      cashCollectedTotal: Math.round(result[0]?.cash || 0),
    };
  }

  private async getPaidOutTotal(driverId: any) {
    const result = await DriverPayout.aggregate<{ total: number }>([
      {
        $match: {
          driver: driverId,
          status: { $in: [DriverPayoutStatus.PENDING, DriverPayoutStatus.PROCESSING, DriverPayoutStatus.PROCESSED] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return Math.round(result[0]?.total || 0);
  }

  private sumDriverEarnings(orders: any[]) {
    return Math.round(orders.reduce((sum, order) => sum + (order.totalPrice || 0) * 0.8, 0));
  }

  private buildWeeklyBreakdown(orders: any[], weekStart: Date) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = Array.from({ length: 7 }, (_, index) => ({
      day: days[index],
      amount: 0,
    }));

    for (const order of orders) {
      const updatedAt = new Date(order.updatedAt || order.createdAt);
      const index = Math.floor((updatedAt.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      if (index >= 0 && index < totals.length) {
        totals[index].amount += Math.round((order.totalPrice || 0) * 0.8);
      }
    }

    return totals;
  }

  private getWeekStart(date: Date) {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private formatServiceLabel(serviceType: string) {
    if (serviceType === "delivery" || serviceType === "helper") return "Delivery";
    return "Ride";
  }

  private getOrderDestination(order: any) {
    const lastStop = order.stops?.[order.stops.length - 1];
    return lastStop?.address?.split(",")[0]?.trim() || "Completed Trip";
  }

  private estimateActiveHours(orders: any[]) {
    const minutes = orders.reduce((sum, order) => {
      if (order.duration) return sum + Number(order.duration);
      return sum + (order.totalDistance || 0) * 4;
    }, 0);

    return Math.round((minutes / 60) * 10) / 10;
  }

  private maskValue(value?: string, visible: number = 4) {
    if (!value) return null;
    const cleanValue = value.replace(/\s/g, "");
    if (cleanValue.length <= visible) return cleanValue;
    return `${"*".repeat(Math.max(0, cleanValue.length - visible))}${cleanValue.slice(-visible)}`;
  }

  private getLicenseStatus(expiry?: Date | string | null): "valid" | "expired" | "pending" {
    if (!expiry) return "pending";
    return new Date(expiry).getTime() >= Date.now() ? "valid" : "expired";
  }

  private formatVehicleType(vehicleType?: string | null) {
    if (!vehicleType) return "Not added";
    if (vehicleType === "bike") return "Bike";
    if (vehicleType === "auto") return "Auto";
    if (vehicleType === "car") return "Car";
    return vehicleType;
  }
}
