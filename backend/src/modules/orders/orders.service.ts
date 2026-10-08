import mongoose from "mongoose";
import Order, { OrderStatus, ServiceType, StopType } from "../../database/models/Order";
import User from "../../database/models/User";
import Driver from "../../database/models/Driver";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import ScheduledDeliveryRequest from "../../database/models/ScheduledDeliveryRequest";
import SupportTicket from "../../database/models/SupportTicket";
import { RoutingService } from "../routing/routing.service";
import { PricingService } from "../pricing/pricing.service";
import { SocketManager } from "../../sockets/socket.manager";
import { QueueManager } from "../../services/queue.service";
import { ZonesService } from "../zones/zones.service";
import Zone from "../../database/models/Zone";
import { ConflictError, NotFoundError, ValidationError } from "../../utils/errors";
import { NotificationService } from "../../services/notification.service";
import { CouponsService } from "../coupons/coupons.service";
import { CartService } from "../cart/cart.service";
import { InvoiceService } from "../../services/invoice.service";
import ChatMessage from "../../database/models/ChatMessage";
import { RefundService } from "../payments/refund.service";
import { assignAndSaveTicket, emitTicketUpdate } from "../../services/supportAssignment.service";
import { getDriverRating } from "../reviews/driver-rating";
import { mapServiceTypeToDriverVehicleType, driverAcceptsServiceType, FOOD_BROADCAST_CONFIG } from "../../config/dispatch.config";
import * as foodDispatch from "../../services/foodDispatch.service";
import { driverPaymentInfo } from "./orders.payment";
import { getOutletOrderingState } from "../../utils/outletOrderingState";
import { clampHelperHours, haversineKm, helperStopsDistanceKm } from "../pricing/helper.pricing";
import { assertHelperTransition, helperPushText, isHelperDone, isHelperOrder, isHelperStart, withoutCustomerCodes } from "./helper.flow";
import { DriverStatus } from "../../database/models/Driver";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];

const isReadyStatus = (status: string) => String(status).toLowerCase() === OrderStatus.PICKING_ITEMS_LC;

/** How long a restaurant has to accept a new food order, in minutes (for messages). */
const ACCEPT_MINUTES = Math.round(FOOD_BROADCAST_CONFIG.restaurantAcceptTimeoutMs / 60000);

export class OrdersService {
  private routingService = new RoutingService();
  private pricingService = new PricingService();
  private zonesService = new ZonesService();
  private couponsService = new CouponsService();
  private cartService = new CartService();
  private refundService = new RefundService();

  /**
   * The price of an order, exactly as createOrder records it. Shared with the online checkout
   * (payments module), so the amount charged through Razorpay is the amount the order gets.
   * Pure calculation: nothing is saved.
   */
  async priceOrder(stopsData: any[], serviceType?: ServiceType, vendorId?: string, totals?: any, metadata?: any) {
    stopsData = await this.pinPickupToOutlet(stopsData, vendorId);
    const startPos = {
      latitude: stopsData[0].latitude || stopsData[0].lat, 
      longitude: stopsData[0].longitude || stopsData[0].lng 
    };

    const optimizationResult = await this.routingService.optimizeAndGetRoute(
      startPos, 
      stopsData.map(s => ({
        id: s.id || Math.random().toString(),
        address: s.address || "Address",
        latitude: s.latitude || s.lat,
        longitude: s.longitude || s.lng,
        type: s.type,
        items: s.items || [],
        instructions: s.instructions,
        deliveryAddress: s.deliveryAddress,
      }))
    );

    if (!optimizationResult) throw new Error("Could not optimize route");

    // Use new fare breakdown for rides, fallback to old pricing for delivery
    const effectiveType = serviceType || ServiceType.DELIVERY;
    const isRide = effectiveType !== ServiceType.DELIVERY;

    let surgeMultiplier = 1.0;
    const activeZonesCount = await Zone.countDocuments({ isActive: true });
    if (activeZonesCount > 0) {
      const zone = await this.zonesService.getZoneForCoordinates(startPos.latitude, startPos.longitude, effectiveType);
      if (zone) {
        surgeMultiplier = zone.pricingMultiplier;
      }
    }

    // A client-supplied discount is only a preview — the coupon is always re-resolved here.
    const requestedCouponCode = metadata?.couponCode ?? totals?.couponCode;
    let couponDiscount = 0;
    let appliedCouponCode: string | undefined;
    let appliedCouponId: any;
    if (requestedCouponCode) {
      const { coupon, discountAmount } = await this.couponsService.resolveForCart(
        String(requestedCouponCode),
        Number(totals?.subtotal) || 0,
        vendorId,
      );
      couponDiscount = discountAmount;
      appliedCouponCode = coupon.code;
      appliedCouponId = coupon._id;
    }

    let totalPrice: number;
    let priceBreakdown: any;

    if (effectiveType === ServiceType.HELPER) {
      // The customer names their offer, but only within the range the server quotes for
      // these hours and this distance (see helper.pricing.ts). No offer: the quoted fare.
      const quote = await this.pricingService.quoteHelper({
        hours: metadata?.duration,
        distanceKm: helperStopsDistanceKm(stopsData),
        surgeMultiplier,
      });
      const offer = Math.round(Number(totals?.total) || 0);
      totalPrice = offer > 0 ? offer : quote.total;
      if (totalPrice < quote.minOffer) {
        throw new ValidationError(`The lowest offer for this task is ₹${quote.minOffer}.`);
      }
      if (totalPrice > quote.maxOffer) {
        throw new ValidationError(`The highest offer for this task is ₹${quote.maxOffer}.`);
      }
      priceBreakdown = {
        baseFare: quote.baseFare,
        distanceFare: quote.distanceFare,
        timeFare: quote.timeFare,
        surgeMultiplier,
        total: totalPrice,
      };
    } else if (isRide) {
      priceBreakdown = await this.pricingService.calculateFareBreakdown(
        effectiveType,
        optimizationResult.totalDistance,
        optimizationResult.estimatedTime,
        surgeMultiplier,
      );
      totalPrice = priceBreakdown.total;
    } else {
      totalPrice = totals?.total ?? await this.pricingService.calculatePrice(
        optimizationResult.totalDistance, 
        optimizationResult.optimizedStops.length,
        surgeMultiplier,
      );
      if (appliedCouponCode) {
        // Rebuild the payable amount from the parts instead of trusting totals.total.
        totalPrice = Math.max(0, Math.round(
          (Number(totals?.subtotal) || 0) +
          (Number(totals?.deliveryFee) || 0) +
          (Number(totals?.tip) || 0) -
          couponDiscount,
        ));
      }
      const rateConfig = await this.pricingService.getRateConfig(effectiveType);
      priceBreakdown = {
        baseFare: totals?.subtotal ?? rateConfig.baseFare,
        distanceFare: totals?.deliveryFee ?? totalPrice - rateConfig.baseFare,
        timeFare: 0,
        surgeMultiplier,
        total: totalPrice,
      };
    }

    return {
      startPos, optimizationResult, effectiveType, isRide, surgeMultiplier,
      couponDiscount, appliedCouponCode, appliedCouponId, totalPrice: totalPrice!, priceBreakdown,
    };
  }

  /**
   * A restaurant / meat-centre order is picked up at the outlet, wherever the client
   * thought it was: the pickup stop takes the outlet's stored location (and address).
   * The customer app never knew it and used to send a point beside the customer.
   * Orders without an outlet, or an outlet with no usable location, pass unchanged.
   */
  private async pinPickupToOutlet(stopsData: any[], vendorId?: string) {
    if (!vendorId || !mongoose.Types.ObjectId.isValid(String(vendorId))) return stopsData;
    const outlet: any =
      (await Vendor.findById(vendorId).select("location address").lean()) ||
      (await MeatCenter.findById(vendorId).select("location address").lean());
    const [lng, lat] = outlet?.location?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return stopsData;

    return stopsData.map((stop) =>
      String(stop?.type || "").toLowerCase() === "pickup"
        ? {
            ...stop,
            latitude: lat,
            longitude: lng,
            lat,
            lng,
            address: typeof outlet.address === "string" && outlet.address.trim() ? outlet.address : stop.address,
          }
        : stop
    );
  }

  /**
   * Refuses a new order for a restaurant / meat centre that isn't taking orders.
   *
   * An order for now needs the outlet open now (its hours, and the partner's
   * "Accepting orders" switch). A scheduled order only needs the switch on —
   * a future slot within its hours is the restaurant's to accept or decline.
   * Rides, courier and helper orders carry no outlet and pass straight through.
   */
  async assertOutletAcceptingOrders(vendorId: string | undefined, opts: { scheduled: boolean }) {
    const outlet = await getOutletOrderingState(vendorId);
    if (!outlet) return;

    if (outlet.manuallyClosed) {
      throw new ConflictError(`${outlet.name} isn't accepting orders right now. Please try again later.`);
    }
    if (opts.scheduled) return;

    if (!outlet.isOpen) {
      throw new ConflictError(
        `${outlet.name} is closed right now${outlet.opensAt ? ` and opens at ${outlet.opensAt}` : ""}. Please order when it's open.`
      );
    }
  }

  async createOrder(userId: string, stopsData: any[], serviceType?: ServiceType, vendorId?: string, totals?: any, radius?: number, duration?: number, isReserved?: boolean, reservedAt?: Date | string, metadata?: any) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid User ID format");
    }
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // A helper task's booked hours set its price; stored clamped to what can be booked.
    if (serviceType === ServiceType.HELPER) {
      duration = clampHelperHours(duration, await this.pricingService.getHelperRates());
    }

    const {
      startPos, optimizationResult, effectiveType, isRide, surgeMultiplier,
      couponDiscount, appliedCouponCode, appliedCouponId, totalPrice, priceBreakdown,
    } = await this.priceOrder(stopsData, serviceType, vendorId, totals, { ...metadata, duration });

    // Scheduled orders. `scheduledFor` is the contract field; scheduledDelivery.requestedAt is
    // the pre-existing transport (payments/verify already forwards it) and is honoured too.
    const scheduledForInput =
      metadata?.scheduledFor ??
      (metadata?.scheduledDelivery?.type === "later" ? metadata.scheduledDelivery.requestedAt : undefined);
    let scheduledForDate: Date | undefined;
    if (scheduledForInput) {
      const parsedSchedule = new Date(scheduledForInput);
      if (!Number.isNaN(parsedSchedule.getTime()) && parsedSchedule.getTime() > Date.now()) {
        scheduledForDate = parsedSchedule;
      } else if (metadata?.scheduledFor) {
        // POST /orders — nothing has been charged yet, so reject outright.
        throw new ValidationError("scheduledFor must be a future date and time");
      } else {
        // Arrived through the already-paid /payments/verify transport and the slot has lapsed.
        // Place the order for now rather than throwing away an order that was just paid for.
        console.warn(`[orders.service] Ignoring lapsed scheduled slot ${scheduledForInput} — placing the order immediately.`);
      }
    }
    const isScheduledOrder = !!scheduledForDate;

    // A closed restaurant takes no new orders. Skipped once the order is already
    // paid: online checkout checks this before charging, and an order paid for
    // while the restaurant closed is placed rather than losing the payment.
    if (metadata?.paymentStatus !== "paid") {
      await this.assertOutletAcceptingOrders(vendorId, { scheduled: isScheduledOrder });
    }

    const effectiveTotals = appliedCouponCode && totals
      ? { ...totals, couponCode: appliedCouponCode, discount: couponDiscount, total: totalPrice }
      : totals;

    const orderStops = optimizationResult.optimizedStops.map((stop: any, index: number) => {
      let normalizedType = StopType.DROP;
      if (stop.type) {
        const typeLC = stop.type.toLowerCase();
        if (typeLC === "pickup") {
          normalizedType = StopType.PICKUP;
        } else if (typeLC === "stop") {
          normalizedType = StopType.STOP;
        } else {
          normalizedType = StopType.DROP;
        }
      } else {
        normalizedType = index === 0 ? StopType.PICKUP : StopType.DROP;
      }

      return {
        sequence: index + 1,
        location: {
          type: "Point",
          coordinates: [stop.longitude, stop.latitude],
        },
        address: stop.address,
        type: normalizedType,
        items: {
          lines: stop.items || [],
          instructions: stop.instructions,
          deliveryAddress: stop.deliveryAddress,
          totals: normalizedType === StopType.DROP ? effectiveTotals : undefined,
        },
      };
    });

    // A restaurant food order waits for the restaurant to accept and quote a prep time;
    // the rider search starts then (restaurantAcceptOrder → foodDispatch.startDispatch).
    const isFoodBroadcast = await foodDispatch.usesFoodBroadcast(effectiveType, vendorId, {
      scheduled: isScheduledOrder,
      reserved: !!isReserved,
    });

    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const restaurantPickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    const generateCustomOrderId = (serviceType: ServiceType) => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const random6Digits = Math.floor(100000 + Math.random() * 900000).toString();
      
      let typeLetter = "F"; // Food Delivery ID
      if (serviceType === ServiceType.HELPER) {
        typeLetter = "T"; // Task ID
      } else if ([ServiceType.BIKE, ServiceType.AUTO, ServiceType.CAB, ServiceType.CAB_PRIME].includes(serviceType)) {
        typeLetter = "R"; // Ride ID
      }

      // "ADS" (the company/app initials) leads every order ID, with the existing
      // service-type letter kept right after it so support staff can still tell
      // food/task/ride orders apart at a glance.
      return `ADS${typeLetter}${day}${month}${year}${random6Digits}`;
    };

    const order = new Order({
      _id: generateCustomOrderId(effectiveType),
      user: userId,
      vendor: vendorId,
      serviceType: effectiveType,
      totalDistance: optimizationResult.totalDistance,
      totalPrice,
      priceBreakdown,
      status: (isReserved || isScheduledOrder || isFoodBroadcast) ? OrderStatus.CREATED : OrderStatus.SEARCHING_DRIVER,
      ...(isFoodBroadcast
        ? {
            dispatchMode: "broadcast",
            dispatch: { state: "idle", offers: [] },
            restaurantAcceptBy: new Date(Date.now() + FOOD_BROADCAST_CONFIG.restaurantAcceptTimeoutMs),
          }
        : {}),
      stops: orderStops,
      radius,
      duration,
      // A helper task's price is the customer's offer; raising it moves both.
      customerPrice: effectiveType === ServiceType.HELPER ? totalPrice : undefined,
      bookingFor: metadata?.bookingFor,
      scheduledDelivery: isScheduledOrder
        ? { ...(metadata?.scheduledDelivery || {}), type: "later", requestedAt: scheduledForDate, restaurantAccepted: false }
        : metadata?.scheduledDelivery,
      scheduledFor: scheduledForDate ?? null,
      scheduleStatus: isScheduledOrder ? "pending" : null,
      couponCode: appliedCouponCode,
      discountAmount: couponDiscount,
      isReserved,
      reservedAt: reservedAt ? new Date(reservedAt) : undefined,
      deliveryOtp,
      restaurantPickupCode,
      polyline: optimizationResult.polyline,
      // Only the payments module passes "online"/"paid", after Razorpay confirmed the money.
      // POST /orders never forwards these, so an app can't mark its own order paid.
      paymentMethod: metadata?.paymentMethod === "online" ? "online" : "cash",
      paymentStatus: metadata?.paymentStatus === "paid" ? "paid" : "pending",
      payment: metadata?.paymentId,
    });

    const savedOrder = await order.save();

    // The restaurant has until restaurantAcceptBy to accept, or the order is cancelled.
    if (isFoodBroadcast && savedOrder.restaurantAcceptBy) {
      foodDispatch.scheduleRestaurantTimeout(savedOrder._id.toString(), savedOrder.restaurantAcceptBy, (id) =>
        this.cancelUnacceptedFoodOrder(id),
      );
    }

    if (appliedCouponId) {
      this.couponsService
        .recordUsage(appliedCouponId)
        .catch((err) => console.error("[orders.service] Failed to record coupon usage:", err));
    }

    // Reuse the existing scheduled-delivery request pipeline (model, vendor screen, sockets)
    // instead of building a second one — the order is simply linked to the request it creates.
    // Payment has already been captured by this point, so a scheduling hiccup must never throw
    // the order away.
    if (isScheduledOrder && vendorId && scheduledForDate) {
      try {
        const scheduleRequest = await this.requestScheduledDelivery(
          userId,
          vendorId,
          scheduledForDate,
          savedOrder._id.toString(),
        );
        savedOrder.set("scheduledDelivery.requestId", scheduleRequest.requestId);
        await savedOrder.save();
      } catch (err) {
        console.error("[orders.service] Failed to create scheduled delivery request:", err);
      }
    }

    // Schedule reservation notification if this is a reserved ride/delivery
    if (savedOrder.isReserved && savedOrder.reservedAt) {
      const fifteenMinutesBefore = savedOrder.reservedAt.getTime() - 15 * 60 * 1000;
      const delay = fifteenMinutesBefore - Date.now();
      await QueueManager.getInstance().scheduleReservedRideNotification(savedOrder._id, delay);
    }

    const result = {
      ...savedOrder.toObject(),
      estimatedTime: optimizationResult.estimatedTime,
      polyline: optimizationResult.polyline,
      isRide,
    };

    // Fetch vendor details for broadcast
    let vendorName = "Restaurant";
    let vendorPhone = "";
    if (vendorId) {
      // Alert the outlet of the new order: in-app history, browser web push for the
      // vendor dashboard, and Expo push for every device signed in to the partner app.
      // sendNotification() is id-agnostic, so this reaches a restaurant (Vendor) and a
      // legacy meat centre (MeatCenter) alike. `kind` tells the partner app what a tap opens.
      NotificationService.getInstance()
        .sendNotification({
          userId: vendorId.toString(),
          title: "New order received 🛎️",
          body: `A new ${effectiveType.toLowerCase()} order just came in. Tap to view details.`,
          type: "transactional",
          category: "order_status",
          data: {
            kind: "new_order",
            orderId: savedOrder._id.toString(),
            customerName: user.name || "Customer",
            totalPrice: savedOrder.totalPrice,
            deepLink: { app: "admin", screen: "/vendor/dashboard" },
          },
        })
        .catch((err) => console.error("[orders.service] Failed to send vendor new-order notification:", err));

      try {
        const vendorObj = await Vendor.findById(vendorId);
        if (vendorObj) {
          vendorName = vendorObj.name;
          vendorPhone = vendorObj.phone;
        }
      } catch (err) {
        console.error("Error fetching vendor for order broadcast:", err);
      }
    }

    // BROADCAST to drivers
    const socketManager = SocketManager.getInstance();
    if (socketManager && isFoodBroadcast) {
      // No driver is searched for yet: the restaurant has to accept first.
      console.log(`🛒 [NEW FOOD ORDER] ${savedOrder._id} — waiting for the restaurant to accept.`);
      this.emitNewOrderToVendor(savedOrder, user, effectiveType);
    } else if (socketManager) {
      const { ZonesService } = require("../zones/zones.service");
      const zonesService = new ZonesService();
      const pickupZone = await zonesService.getZoneForCoordinates(startPos.latitude, startPos.longitude);
      const pickupZoneName = pickupZone ? pickupZone.name : "Unknown Pickup Zone";

      // Load Zone map for human-readable driver zone names
      const ZoneModel = require("../../database/models/Zone").default;
      const allZones = await ZoneModel.find().lean();
      const zoneNameMap = new Map<string, string>();
      allZones.forEach((z: any) => zoneNameMap.set(z._id.toString(), z.name));

      console.log("\n============================================================");
      console.log("🛒 [NEW ORDER BOOKED]");
      console.log(`Order ID: ${savedOrder._id}`);
      console.log(`👤 Customer: ${user.name || "N/A"} (${user.phone || "N/A"})`);
      console.log(`📍 Booked Pickup Zone: "${pickupZoneName}"`);
      console.log(`Service Type: ${effectiveType}`);

      // 1. Find nearby/matching drivers
      const { DriverService } = require("../drivers/drivers.service");
      const driversService = new DriverService();
      
      let nearbyDrivers: any[] = [];
      try {
        nearbyDrivers = await driversService.getNearbyDrivers(
          startPos.latitude,
          startPos.longitude,
          undefined, // Let 3-Stage Dynamic Expansion drive search radius per vehicle type
          effectiveType,
          true
        );
      } catch (err) {
        console.error("Error getting nearby drivers in createOrder:", err);
      }

      let driversToNotify = [...nearbyDrivers];
      // Fallback, in two steps: drivers registered to the pickup zone first, then —
      // rather than giving up — any driver who is simply online and free.
      //
      // The zone is a serviceability check for the *customer*; it is not a reason to
      // hide a job from a driver who is on shift nearby. preferredZone is only ever
      // set once (see DriverService.updateLocation), so gating the last fallback on it
      // left orders undispatched while drivers sat idle — the symptom being that a
      // helper task only reached anyone after a price raise, which took a different
      // path and broadcast to every driver.
      if (driversToNotify.length === 0) {
        const onlineQuery: any = { status: "ONLINE", isAvailable: true };
        // Rides must still go to a driver with the right vehicle — this is the last
        // resort before giving up on the booking, not a license to hand a cab ride to
        // a bike driver. Food/meat/helper orders have no vehicle constraint, matching
        // getNearbyDrivers' own rule, so they're left unfiltered. Mapped through
        // mapServiceTypeToDriverVehicleType, NOT the raw tier string — Driver.vehicleType
        // has no "cab"/"cab_prime" value (only bike/auto/car), so filtering on the raw
        // tier here would silently match zero drivers for every cab ride.
        const fallbackVehicleType = mapServiceTypeToDriverVehicleType(effectiveType);
        if (fallbackVehicleType) {
          onlineQuery.vehicleType = fallbackVehicleType;
        }
        try {
          if (pickupZone) {
            driversToNotify = await Driver.find({ ...onlineQuery, preferredZone: pickupZone._id }).populate("user");
          }
          if (driversToNotify.length === 0) {
            driversToNotify = await Driver.find(onlineQuery).populate("user");
            console.log(`[DISPATCH FALLBACK] No zone-matched drivers; offering to ${driversToNotify.length} online driver(s).`);
          }
          // Same GPS-freshness rule as getNearbyDrivers: a driver whose app was
          // killed without going offline still reads ONLINE/isAvailable here, and
          // offering to one just burns the dispatcher's full per-driver timeout
          // instead of reaching someone who can actually answer.
          driversToNotify = driversService.filterDriversWithLiveLocation(driversToNotify, "createOrder fallback");
          // Same for a driver who is online but has this order's category toggled
          // off (see driverAcceptsServiceType) — their app would silently drop the
          // offer, so offering it to them here would just be another guaranteed
          // timeout instead of reaching a driver who can actually act on it.
          const beforeServiceFilter = driversToNotify.length;
          driversToNotify = driversToNotify.filter((d: any) => driverAcceptsServiceType(d.activeServices, effectiveType));
          if (driversToNotify.length < beforeServiceFilter) {
            console.log(`[DISPATCH FALLBACK] Skipped ${beforeServiceFilter - driversToNotify.length} driver(s) not opted into this order's category.`);
          }
        } catch (err) {
          console.error("Error fetching fallback online drivers:", err);
        }
      }

      // 2. Filter drivers in homeMode
      const filteredDrivers: any[] = [];
      const pickupCoords = savedOrder.stops[0]?.location?.coordinates;
      const dropoffCoords = savedOrder.stops[savedOrder.stops.length - 1]?.location?.coordinates;

      if (pickupCoords && dropoffCoords) {
        for (const d of driversToNotify) {
          if (d.homeMode === true) {
            // Guarded per driver: this check reads other documents and used to write
            // to disk, and it was unguarded — so one driver's failure threw out of
            // createOrder and failed the customer's booking outright. A driver whose
            // check errors is kept as a candidate rather than silently dropped.
            let onTheWay = true;
            try {
              onTheWay = await driversService.isOrderOnTheWayToHome(
                (d._id as any).toString(),
                pickupCoords,
                dropoffCoords
              );
            } catch (err) {
              console.error(`[DISPATCH] Home-mode check failed for driver ${d._id}; keeping as candidate:`, err);
            }
            if (onTheWay) {
              filteredDrivers.push(d);
            }
          } else {
            filteredDrivers.push(d);
          }
        }
        driversToNotify = filteredDrivers;

        const droppedByHomeMode = driversToNotify.length;
        console.log(
          `[DISPATCH] ${effectiveType} order ${savedOrder._id}: ${droppedByHomeMode} candidate(s) after home-mode filter.`
        );
      }

      console.log(`\n📢 [NOTIFIED DRIVERS]: ${driversToNotify.length} drivers selected`);
      driversToNotify.forEach((d: any) => {
        const uName = (d.user as any)?.name || "Unknown";
        const uPhone = (d.user as any)?.phone || "No Phone";
        const dZoneName = d.preferredZone ? (zoneNameMap.get(d.preferredZone.toString()) || "Unknown Zone") : "No Zone";
        console.log(`   🚗 Driver: ${uName} (${uPhone}) | Driver ID: ${d._id} | Assigned Zone: "${dZoneName}"`);
      });
      console.log("============================================================\n");

      // 3. Emit real-time WebSocket events specifically to the matched/filtered drivers
      const orderPayload = this.buildDriverOfferPayload(savedOrder, user, {
        distance: `${optimizationResult.totalDistance} km`,
        duration: duration ? `${duration} hrs` : `${optimizationResult.estimatedTime} min`,
        vendorName,
        vendorPhone,
      });

      const sortedCandidateInfos = this.sortCandidatesNearestFirst(driversToNotify, startPos.latitude, startPos.longitude);

      console.log(`[SEQUENTIAL DISPATCH] Sorted ${sortedCandidateInfos.length} candidate drivers by distance for order ${savedOrder._id}`);

      // Save total candidates count to DB
      savedOrder.totalCandidatesCount = sortedCandidateInfos.length;
      await savedOrder.save();

      // Start Sequential Dispatch Cascade (1 driver at a time, nearest first).
      // A scheduled order is dispatched when its slot is accepted, not at booking time.
      if (!isScheduledOrder) {
        const { dispatchManager } = require("../../services/dispatch.manager");
        await dispatchManager.startDispatch(savedOrder._id.toString(), sortedCandidateInfos, {
          ...orderPayload,
          customerUserId: userId,
        });
      }

      // NOTIFY vendor/restaurant
      if (vendorId && !isReserved) {
        this.emitNewOrderToVendor(savedOrder, user, effectiveType);
      }
    }

    return result;
  }

  /**
   * What a driver is offered (the `new_order` socket event), for a new order and for a
   * re-dispatch after a price raise. A helper task carries its description and booked hours,
   * and none of the customer's codes.
   */
  private buildDriverOfferPayload(
    order: any,
    user: any,
    extra: { distance: string; duration: string; vendorName?: string; vendorPhone?: string },
  ) {
    const helper = isHelperOrder(order);
    const price = order.customerPrice || order.totalPrice;
    return {
      id: order._id,
      serviceType: order.serviceType,
      distance: extra.distance,
      duration: extra.duration,
      radius: order.radius,
      earnings: Math.round(price * 0.8),
      customerPrice: order.customerPrice,
      // What the driver must know before accepting: prepaid online, or cash to collect.
      ...this.driverPaymentInfo(order),
      bookingFor: order.bookingFor,
      scheduledDelivery: order.scheduledDelivery,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || "N/A",
      vendorName: extra.vendorName ?? "Restaurant",
      vendorPhone: extra.vendorPhone ?? "",
      status: "pending",
      timestamp: new Date(),
      ...(helper
        ? {
            bookedHours: order.duration,
            taskDescription: order.stops?.[0]?.items?.instructions || "",
          }
        : { restaurantPickupCode: order.restaurantPickupCode }),
      isReserved: order.isReserved,
      reservedAt: order.reservedAt,
      stops: order.stops.map((s: any) => ({
        id: s._id,
        type: s.type.toLowerCase(),
        locationName: s.address?.split(',')[0],
        address: s.address,
        lat: s.location.coordinates[1],
        lng: s.location.coordinates[0],
        items: s.items,
        instructions: s.items?.instructions,
      })),
    };
  }

  /** Candidate drivers for the sequential dispatcher, nearest to (lat, lng) first. */
  private sortCandidatesNearestFirst(drivers: any[], lat: number, lng: number) {
    return drivers
      .filter((d: any) => d?.user?._id)
      .map((d: any) => {
        const coords = d.currentLocation?.coordinates;
        const distanceMeters = coords && coords.length >= 2 ? haversineKm(lat, lng, coords[1], coords[0]) * 1000 : 0;
        return {
          driverId: d._id.toString(),
          driverUserId: d.user._id.toString(),
          distanceMeters,
          driverName: (d.user as any)?.name,
          driverPhone: (d.user as any)?.phone,
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  private emitNewOrderToVendor(savedOrder: any, user: any, effectiveType: ServiceType) {
    const vendorId = savedOrder.vendor?.toString();
    if (!vendorId) return;
    console.log(`[SOCKET] Emitting new_order_vendor to vendor ${vendorId}`);
    SocketManager.getInstance().emitToUser(vendorId, "new_order_vendor", {
      id: savedOrder._id,
      serviceType: effectiveType,
      totalPrice: savedOrder.totalPrice,
      customerName: user.name || "Customer",
      customerPhone: user.phone || "N/A",
      status: savedOrder.status,
      dispatchMode: savedOrder.dispatchMode,
      timestamp: savedOrder.createdAt,
      restaurantPickupCode: savedOrder.restaurantPickupCode,
      scheduledDelivery: savedOrder.scheduledDelivery,
      stops: savedOrder.stops.map((s: any) => ({
        id: s._id,
        type: s.type.toLowerCase(),
        locationName: s.address?.split(',')[0],
        address: s.address,
        lat: s.location.coordinates[1],
        lng: s.location.coordinates[0],
        items: s.items,
      }))
    }, "orders.createOrder.vendor");
  }

  /**
   * The restaurant accepts a food order and says how long it will take. This is where
   * the rider search starts: the prep time becomes the search radius (see
   * services/foodDispatch.service.ts). Only for orders created with dispatchMode "broadcast".
   */
  async restaurantAcceptOrder(orderId: string, prepMinutes: number) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");
    if (order.dispatchMode !== "broadcast") {
      throw new ConflictError("This order doesn't need to be accepted. Mark it ready when it's packed.");
    }

    // Atomic, so a customer cancelling at the same moment can't end up with an
    // accepted, cancelled order and a rider sent for it.
    const accepted = await Order.findOneAndUpdate(
      { _id: order._id, dispatchMode: "broadcast", status: OrderStatus.CREATED, restaurantAcceptedAt: null },
      { $set: { status: OrderStatus.SEARCHING_DRIVER, restaurantAcceptedAt: new Date(), prepMinutes } },
      { new: true },
    );
    if (!accepted) {
      const current = await Order.findOne(this.getOrderQuery(orderId)).select("status cancelReason").lean();
      if (current?.cancelReason === "restaurant_timeout") {
        throw new ConflictError(`This order was cancelled because it wasn't accepted within ${ACCEPT_MINUTES} minutes.`);
      }
      if (current?.status === OrderStatus.CANCELLED) throw new ConflictError("This order was cancelled.");
      throw new ConflictError("This order was already accepted.");
    }
    foodDispatch.clearRestaurantTimeout(accepted._id.toString());

    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      const update = { orderId: accepted._id.toString(), status: accepted.status };
      socketManager.emitToOrderRoom(update.orderId, "order_status_update", update);
      socketManager.emitToUser(accepted.user.toString(), "customer_order_list_update", update);
      socketManager.emitToUser(accepted.vendor!.toString(), "order_status_update_vendor", update);
    }

    NotificationService.getInstance()
      .sendNotification({
        userId: accepted.user.toString(),
        title: "Restaurant accepted your order 🍳",
        body: `Your food will be ready in about ${prepMinutes} min. We're finding a delivery partner.`,
        type: "transactional",
        category: "order_status",
        data: {
          orderId: accepted._id,
          status: accepted.status,
          serviceType: accepted.serviceType,
          deepLink: { screen: "/tracking", params: { orderId: accepted._id.toString() } },
        },
      })
      .catch((err) => console.error("[orders.service] Failed to send restaurant-accepted notification:", err));

    // Not awaited: the restaurant is waiting for its button, not for a rider.
    foodDispatch.startDispatch(accepted._id.toString(), "accepted");

    return Order.findOne(this.getOrderQuery(orderId)).populate("user").populate("driver").populate("vendor");
  }

  /**
   * "Food is ready" on a food order that has no rider yet. The order's status stays
   * SEARCHING_DRIVER — the rider app reads picking_items as "the rider is at the
   * counter" — and the search runs again now that the food is waiting.
   */
  private async markFoodReadyBeforeRider(order: any) {
    order.foodReadyAt = order.foodReadyAt || new Date();
    await order.save();

    const socketManager = SocketManager.getInstance();
    socketManager?.emitToUser(order.vendor.toString(), "order_status_update_vendor", {
      orderId: order._id.toString(),
      status: order.status,
      foodReadyAt: order.foodReadyAt,
    });

    if (["searching", "unassigned"].includes(order.dispatch?.state)) {
      foodDispatch.startDispatch(order._id.toString(), "food is ready");
    }
    return Order.findOne(this.getOrderQuery(order._id.toString())).populate("user").populate("driver").populate("vendor");
  }

  /**
   * The restaurant didn't accept a food order in time (restaurantAcceptBy). Cancelled
   * atomically — only if it is still unaccepted, so an accept that lands at the last
   * moment wins — then refunded and announced like any other cancellation.
   */
  async cancelUnacceptedFoodOrder(orderId: string) {
    const cancelled = await Order.findOneAndUpdate(
      { _id: orderId, dispatchMode: "broadcast", status: OrderStatus.CREATED, restaurantAcceptedAt: null },
      { $set: { status: OrderStatus.CANCELLED, cancelReason: "restaurant_timeout" } },
      { new: true },
    );
    if (!cancelled) return null; // accepted or cancelled in the meantime

    console.warn(`⏰ [FOOD ORDER] ${orderId} cancelled — the restaurant didn't accept within ${ACCEPT_MINUTES} min.`);

    NotificationService.getInstance()
      .sendNotification({
        userId: cancelled.vendor!.toString(),
        title: "Order cancelled ⏰",
        body: `Order ${cancelled._id} was cancelled because it wasn't accepted within ${ACCEPT_MINUTES} minutes.`,
        type: "transactional",
        category: "order_status",
        data: { kind: "order_cancelled", orderId: cancelled._id.toString(), deepLink: { app: "admin", screen: "/vendor/dashboard" } },
      })
      .catch((err) => console.error("[orders.service] Failed to tell the restaurant about an accept timeout:", err));

    // Status is already CANCELLED: this runs the usual refund, sockets and customer push.
    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED, {
      reason: "restaurant_timeout",
      customerMessage: "The restaurant didn't accept your order in time, so it has been cancelled.",
    });
  }

  async requestScheduledDelivery(userId: string, vendorId: string, scheduledFor: Date | string, orderId?: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid User ID format");
    if (!vendorId) throw new Error("Vendor is required");

    const user = await User.findById(userId);
    const vendor = await Vendor.findById(vendorId);
    if (!user) throw new Error("User not found");
    if (!vendor) throw new Error("Vendor not found");

    const requestedAt = new Date(scheduledFor);
    if (Number.isNaN(requestedAt.getTime()) || requestedAt.getTime() <= Date.now()) {
      throw new Error("Choose a valid future delivery time");
    }

    const requestId = `SCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerId = user._id.toString();

    const saved = await ScheduledDeliveryRequest.create({
      requestId,
      customer: user._id,
      vendor: vendor._id,
      customerName: user.name || "Customer",
      customerPhone: user.phone || "",
      scheduledFor: requestedAt,
      status: "pending",
      order: orderId,
    });

    const payload = {
      requestId,
      vendorId: vendor._id.toString(),
      customerId,
      orderId,
      customerName: saved.customerName,
      customerPhone: saved.customerPhone,
      scheduledFor: requestedAt.toISOString(),
      status: "pending",
    };

    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      socketManager.emitToUser(vendor._id.toString(), "scheduled_delivery_request", payload);
      socketManager.emitToUser(customerId, "scheduled_delivery_pending", payload);
    }

    // The socket only reaches an open app; a push reaches the partner's phone even when
    // it's closed, and the customer is waiting on an accept/decline.
    NotificationService.getInstance()
      .sendNotification({
        userId: vendor._id.toString(),
        title: "Scheduled delivery request 📅",
        body: `${saved.customerName} wants a delivery at ${requestedAt.toLocaleString("en-IN", {
          timeZone: process.env.BUSINESS_TIMEZONE || "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        })}. Tap to accept or decline.`,
        type: "transactional",
        category: "order_status",
        data: {
          kind: "scheduled_request",
          requestId,
          customerName: saved.customerName,
          customerPhone: saved.customerPhone,
          scheduledFor: requestedAt.toISOString(),
          deepLink: { app: "admin", screen: "/vendor/scheduled-orders" },
        },
      })
      .catch((err) => console.error("[orders.service] Failed to send scheduled-request notification:", err));

    return {
      requestId,
      vendorId: vendor._id.toString(),
      customerId,
      orderId,
      scheduledFor: requestedAt.toISOString(),
      status: "pending",
    };
  }

  async getVendorScheduledDeliveryRequests(vendorId: string) {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) throw new Error("Invalid vendor ID");
    const requests = await ScheduledDeliveryRequest.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .lean();
    return requests.map((request) => ({
      requestId: request.requestId,
      vendorId: request.vendor.toString(),
      customerId: request.customer.toString(),
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      orderId: request.order,
      scheduledFor: request.scheduledFor,
      status: request.status,
      respondedAt: request.respondedAt,
      createdAt: request.createdAt,
    }));
  }

  async getScheduledDeliveryRequestStatus(requestId: string, customerId: string) {
    const request = await ScheduledDeliveryRequest.findOne({ requestId, customer: customerId }).lean();
    if (!request) throw new Error("Scheduled delivery request not found");
    return {
      requestId: request.requestId,
      vendorId: request.vendor.toString(),
      customerId: request.customer.toString(),
      scheduledFor: request.scheduledFor,
      status: request.status,
      respondedAt: request.respondedAt,
    };
  }

  async respondToScheduledDelivery(requestId: string, vendorId: string, accepted: boolean, reason?: string) {
    const request = await ScheduledDeliveryRequest.findOne({ requestId, vendor: vendorId });
    if (!request) throw new Error("Scheduled delivery request not found");
    if (request.status !== "pending") {
      throw new Error(`Request already ${request.status}`);
    }

    request.status = accepted ? "accepted" : "rejected";
    request.respondedAt = new Date();
    await request.save();

    const customerId = request.customer.toString();
    const payload = {
      requestId: request.requestId,
      vendorId: request.vendor.toString(),
      customerId,
      orderId: request.order,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      scheduledFor: request.scheduledFor.toISOString(),
      accepted,
      status: request.status,
      reason: accepted ? undefined : reason,
    };

    // Carry the vendor's verdict onto the order it belongs to, if there is one.
    if (request.order) {
      const order = await Order.findOne(this.getOrderQuery(request.order));
      if (order) {
        await this.applyScheduleDecisionToOrder(order, accepted, reason);
      }
    }

    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      socketManager.emitToUser(
        customerId,
        accepted ? "scheduled_delivery_accepted" : "scheduled_delivery_rejected",
        payload,
      );
    }

    await this.notifyScheduleDecision(customerId, request.order, request.scheduledFor, accepted, reason);

    return payload;
  }

  /**
   * Scheduled orders for the admin screen, newest first.
   */
  async getScheduledOrders() {
    const orders = await Order.find({ scheduledFor: { $ne: null } })
      .populate("user", "name phone email")
      .populate("vendor", "name phone address")
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((order: any) => ({
      ...order,
      items: this.extractOrderItems(order),
    }));
  }

  /**
   * Admin accept/reject of a scheduled order, addressed by order id. Mirrors the verdict onto
   * the linked ScheduledDeliveryRequest so the vendor screen stays in step, and notifies the
   * customer through the same NotificationService the vendor path uses.
   */
  async respondToOrderSchedule(orderId: string, action: "accept" | "reject", reason?: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");
    if (!order.scheduledFor) {
      throw new ValidationError("This order is not a scheduled order");
    }
    if (order.scheduleStatus && order.scheduleStatus !== "pending") {
      throw new ValidationError(`This scheduled order was already ${order.scheduleStatus}`);
    }

    const accepted = action === "accept";
    await this.applyScheduleDecisionToOrder(order, accepted, reason);

    const requestId = order.scheduledDelivery?.requestId;
    if (requestId) {
      await ScheduledDeliveryRequest.updateOne(
        { requestId, status: "pending" },
        { $set: { status: accepted ? "accepted" : "rejected", respondedAt: new Date() } },
      );
    }

    const customerId = order.user.toString();
    const payload = {
      orderId: order._id,
      requestId,
      customerId,
      vendorId: order.vendor?.toString(),
      scheduledFor: order.scheduledFor ? new Date(order.scheduledFor).toISOString() : null,
      accepted,
      status: order.status,
      scheduleStatus: order.scheduleStatus,
      scheduleRejectionReason: order.scheduleRejectionReason ?? undefined,
    };

    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      socketManager.emitToUser(
        customerId,
        accepted ? "scheduled_delivery_accepted" : "scheduled_delivery_rejected",
        payload,
      );
    }

    await this.notifyScheduleDecision(customerId, order._id, order.scheduledFor, accepted, reason);

    return payload;
  }

  private async applyScheduleDecisionToOrder(order: any, accepted: boolean, reason?: string) {
    order.scheduleStatus = accepted ? "accepted" : "rejected";

    if (!order.scheduledDelivery) {
      order.scheduledDelivery = { type: "later", requestedAt: order.scheduledFor };
    }

    if (accepted) {
      order.scheduledDelivery.restaurantAccepted = true;
      order.scheduledDelivery.acceptedAt = new Date();
      order.scheduleRejectionReason = null;
      order.isReserved = true;
      order.reservedAt = order.scheduledFor ?? order.reservedAt;
    } else {
      order.scheduledDelivery.restaurantAccepted = false;
      order.scheduleRejectionReason = reason || "The restaurant could not take this order for the requested slot";
      order.status = OrderStatus.CANCELLED;
      order.cancelReason = "restaurant_rejected";
    }

    await order.save();
    if (!accepted) await this.refundIfPaidOnline(order._id.toString(), "scheduled_order_rejected");
    return order;
  }

  /**
   * Who may see or change an order. Everyone else gets "not found" (never "forbidden"), so
   * order ids can't be probed. Roles come from the verified token only.
   *   admin / support : every order
   *   customer        : their own orders
   *   driver          : orders assigned to them
   *   vendor          : orders placed with their outlet (token id = Vendor / MeatCenter id)
   */
  async getOrderForActor(orderId: string, actor: { userId?: string; role?: string } | undefined) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order || !actor?.userId) throw new NotFoundError("Order not found");
    const relation = await this.orderRelation(order, actor);
    if (!relation) throw new NotFoundError("Order not found");
    return { order, relation };
  }

  async orderRelation(order: any, actor: { userId?: string; role?: string }) {
    const role = String(actor.role || "");
    if (role === "ADMIN" || role === "SUPPORT") return "staff" as const;
    if (order.user?.toString() === actor.userId) return "customer" as const;
    if (VENDOR_ROLES.includes(role) && order.vendor?.toString() === actor.userId) return "vendor" as const;
    if (role === "DRIVER" && order.driver) {
      const driver = await Driver.findOne({ user: actor.userId }).select("_id").lean();
      if (driver && order.driver.toString() === driver._id.toString()) return "driver" as const;
    }
    return null;
  }

  /** Staff, or the vendor whose own id this is. */
  canActForVendor(vendorId: string, actor: { userId?: string; role?: string } | undefined) {
    const role = String(actor?.role || "");
    if (role === "ADMIN" || role === "SUPPORT") return true;
    return VENDOR_ROLES.includes(role) && !!actor?.userId && actor.userId === String(vendorId);
  }

  /** See orders.payment.ts. */
  driverPaymentInfo(order: any) {
    return driverPaymentInfo(order);
  }

  /**
   * The assigned driver confirms they received the cash for a cash order. The expected amount
   * is the order's own total; the driver only confirms it. Idempotent: a repeat returns the
   * already-recorded collection and never records a second one.
   */
  async confirmCashCollected(orderId: string, driverUserId: string, amount: number) {
    const driver = await Driver.findOne({ user: driverUserId }).select("_id");
    if (!driver) throw new NotFoundError("Driver profile not found");

    const order = await Order.findOne(this.getOrderQuery(orderId));
    // Not this driver's order: answer "not found" so order ids can't be probed.
    if (!order || !order.driver || order.driver.toString() !== driver._id.toString()) {
      throw new NotFoundError("Order not found");
    }
    if (order.paymentMethod !== "cash") {
      throw new ConflictError("This order was paid online. There is no cash to collect.");
    }

    const expected = Math.round(Number(order.totalPrice) || 0);
    if (order.cashCollected) {
      if (Math.round(amount) === order.cashCollectedAmount) return order; // duplicate tap / retry
      throw new ConflictError(`Cash was already recorded as ₹${order.cashCollectedAmount} for this order.`);
    }

    const notCollectable = [
      OrderStatus.CREATED, OrderStatus.SEARCHING_DRIVER, OrderStatus.CONFIRMED, OrderStatus.CANCELLED,
      OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC, OrderStatus.COMPLETED,
    ];
    if (notCollectable.includes(order.status)) {
      throw new ConflictError("Cash can't be recorded for this order in its current state.");
    }
    if (Math.round(amount) !== expected) {
      throw new ValidationError(`The amount to collect for this order is ₹${expected}. Please collect the full amount.`);
    }

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        driver: driver._id,
        paymentMethod: "cash",
        cashCollected: { $ne: true },
        status: { $nin: notCollectable },
      },
      {
        $set: {
          cashCollected: true,
          cashCollectedAt: new Date(),
          cashCollectedAmount: expected,
          cashCollectedBy: driver._id,
          paymentStatus: "cash_collected",
        },
      },
      { new: true },
    );
    if (!updated) {
      const current = await Order.findOne(this.getOrderQuery(orderId));
      if (current?.cashCollected && current.cashCollectedAmount === Math.round(amount)) return current;
      throw new ConflictError("This order changed while recording the cash. Please refresh and try again.");
    }

    const socketManager = SocketManager.getInstance();
    socketManager?.emitToOrderRoom(updated._id.toString(), "order_payment_update", {
      orderId: updated._id.toString(),
      paymentMethod: "cash",
      paymentStatus: "cash_collected",
      cashCollectedAmount: expected,
    });

    // The customer hears about every cash collection, so a false claim can be disputed.
    NotificationService.getInstance()
      .sendNotification({
        userId: updated.user.toString(),
        title: "Cash payment received",
        body: `Your driver recorded ₹${expected} cash for order ${updated._id}. If this is wrong, please contact support.`,
        type: "transactional",
        category: "order_status",
        data: { orderId: updated._id, deepLink: { screen: "/(tabs)/orders" } },
      })
      .catch((err) => console.error("[orders.service] Failed to send cash-collected notification:", err));

    return Order.findOne(this.getOrderQuery(orderId)).populate("user").populate("driver").populate("vendor");
  }

  /**
   * Starts a real Razorpay refund for a cancelled order that was paid online. Cash and unpaid
   * orders are skipped inside RefundService. Never throws: a refund problem must not undo the
   * cancellation — it is recorded on the order (refundStatus / refundFailureReason) instead.
   */
  private async refundIfPaidOnline(orderId: string, reason: string) {
    try {
      // A helper task's online price raises were separate payments; they go back too.
      await this.refundService.refundOrderTopups(orderId, reason).catch((error) =>
        console.error(`[orders.service] ALERT top-up refunds for order ${orderId} threw:`, error),
      );
      return await this.refundService.refundCancelledOrder(orderId, reason);
    } catch (error) {
      console.error(`[orders.service] ALERT refund attempt for order ${orderId} threw:`, error);
      return null;
    }
  }

  /** The refund sentence for a cancellation notice, based on what Razorpay actually answered. */
  private async refundNotice(orderId: string | undefined) {
    if (!orderId) return "";
    const order = await Order.findOne(this.getOrderQuery(orderId)).select("paymentMethod refundStatus refundAmount").lean();
    if (!order || order.paymentMethod !== "online") return "";
    const amount = order.refundAmount ? `₹${order.refundAmount} ` : "";
    switch (order.refundStatus) {
      case "processed":
        return ` Your refund of ${amount}has been processed to your original payment method.`;
      case "pending":
        return ` A refund of ${amount}has been initiated to your original payment method. We'll notify you once it's processed.`;
      case "failed":
        return " We couldn't start your refund automatically. Our support team will process it and contact you.";
      default:
        return "";
    }
  }

  private async notifyScheduleDecision(
    customerId: string,
    orderId: string | undefined,
    scheduledFor: Date | null | undefined,
    accepted: boolean,
    reason?: string,
  ) {
    const slot = scheduledFor ? new Date(scheduledFor).toLocaleString() : "the requested slot";
    try {
      await NotificationService.getInstance().sendNotification({
        userId: customerId,
        title: accepted ? "Scheduled order confirmed ✅" : "Scheduled order rejected ❌",
        body: accepted
          ? `Your order is confirmed for ${slot}.`
          : `The restaurant could not take your order for ${slot}.${reason ? ` Reason: ${reason}.` : ""}${await this.refundNotice(orderId)}`,
        type: "transactional",
        category: "order_status",
        data: {
          orderId,
          scheduleStatus: accepted ? "accepted" : "rejected",
          scheduleRejectionReason: accepted ? undefined : reason,
          deepLink: { screen: "/(tabs)/orders" },
        },
      });
    } catch (err) {
      console.error("[orders.service] Failed to send scheduled-order notification:", err);
    }
  }

  async estimateFare(
    pickupLat: number,
    pickupLng: number,
    dropLat: number,
    dropLng: number,
    serviceType: ServiceType,
  ) {
    // Calculate approximate distance using Haversine
    const distanceInKm = this.haversineDistance(pickupLat, pickupLng, dropLat, dropLng);
    const estimatedMinutes = Math.round(distanceInKm * 4); // assume avg speed 15 km/h

    let surgeMultiplier = 1.0;
    const activeZonesCount = await Zone.countDocuments({ isActive: true });
    if (activeZonesCount > 0) {
      const zone = await this.zonesService.getZoneForCoordinates(pickupLat, pickupLng, serviceType);
      if (zone) {
        surgeMultiplier = zone.pricingMultiplier;
      }
    }

    const breakdown = await this.pricingService.calculateFareBreakdown(
      serviceType,
      distanceInKm,
      estimatedMinutes,
      surgeMultiplier,
    );

    return {
      distanceInKm: Math.round(distanceInKm * 10) / 10,
      estimatedMinutes,
      fareBreakdown: breakdown,
    };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getOrderQuery(orderId: string): any {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      return { $or: [{ _id: orderId }, { _id: new mongoose.Types.ObjectId(orderId) }] };
    }
    return { _id: orderId };
  }

  async getOrderById(orderId: string) {
    if (!orderId) {
      return null;
    }
    const order = await Order.findOne(this.getOrderQuery(orderId))
      .populate("user")
      .populate({
        path: "driver",
        populate: { path: "user" }
      })
      .populate("vendor");

    // Dynamically adjust totalCandidatesCount based on active online status of the candidates
    if (order && order.status === OrderStatus.SEARCHING_DRIVER) {
      try {
        const { dispatchManager } = require("../../services/dispatch.manager");
        const session = dispatchManager.activeDispatches.get(order._id.toString());
        if (session && session.candidates) {
          const candidateUserIds = session.candidates.map((c: any) => c.driverUserId);
          const onlineCount = await Driver.countDocuments({
            user: { $in: candidateUserIds },
            status: DriverStatus.ONLINE,
            isAvailable: true
          });
          order.totalCandidatesCount = onlineCount;
        }
      } catch (err: any) {
        console.error("[DYNAMIC CANDIDATE COUNT ERROR]:", err.message);
      }
    }

    return order;
  }

  /**
   * Fetch chat history for an order, restricted to that order's customer or assigned driver
   * (used to hydrate the chat screen when opened via a deep link, not just live socket messages).
   */
  async getChatHistory(orderId: string, requestingUserId: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId)).populate({
      path: "driver",
      populate: { path: "user" },
    });
    if (!order) throw new Error("Order not found");

    const driverUserId = (order.driver as any)?.user?._id?.toString();
    const isParty = order.user?.toString() === requestingUserId || driverUserId === requestingUserId;
    if (!isParty) throw new Error("Unauthorized to view this chat");

    return ChatMessage.find({ orderId: order._id.toString() }).sort({ createdAt: 1 });
  }

  async increaseOrderPrice(orderId: string, amount: number, userId: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");

    if (order.user.toString() !== userId) {
      throw new Error("Unauthorized to modify this order");
    }
    this.assertPriceCanRise(order);
    // Money already taken online: the extra is paid through POST /payments/create-topup, which
    // applies it here (applyPriceIncrease) once Razorpay confirms it.
    if (order.paymentMethod === "online" && order.paymentStatus === "paid") {
      throw new ConflictError("Pay the extra amount online to raise the price of this task.", "TOPUP_REQUIRED");
    }
    await this.assertRaiseWithinRange(order, amount);
    return this.applyPriceIncrease(order._id.toString(), amount);
  }

  /** Only a task still looking for someone can have its price raised. */
  assertPriceCanRise(order: any) {
    if (order.status !== OrderStatus.SEARCHING_DRIVER && order.status !== OrderStatus.CREATED) {
      throw new ConflictError("The price can only be raised while we're still looking for someone.");
    }
    // Re-dispatching below is the sequential dispatcher's; it would hijack a food order's search.
    if (order.dispatchMode === "broadcast") {
      throw new ValidationError("The price of a food order can't be raised.");
    }
  }

  /** A helper task's raised price must stay under the quote's ceiling. */
  async assertRaiseWithinRange(order: any, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
      throw new ValidationError("Invalid amount to increase");
    }
    if (!isHelperOrder(order)) return;
    const quote = await this.pricingService.quoteHelper({
      hours: order.duration,
      distanceKm: helperStopsDistanceKm(order.stops),
      surgeMultiplier: order.priceBreakdown?.surgeMultiplier,
    });
    const current = order.customerPrice || order.totalPrice;
    if (current + amount > quote.maxOffer) {
      throw new ValidationError(`The highest offer for this task is ₹${quote.maxOffer}.`);
    }
  }

  /**
   * Raises the price and starts a fresh search round at it: everyone nearby — including the
   * helpers who passed at the lower price — is offered it again, nearest first. Used by a
   * cash raise and by a paid online top-up. Returns null when the order can no longer be
   * raised (it was taken or cancelled meanwhile), so a top-up can be refunded.
   */
  async applyPriceIncrease(orderId: string, amount: number, opts: { topupPaymentId?: any } = {}) {
    const raise = Math.round(amount);
    // Atomic, so a raise that races an accept or a cancel doesn't land on a taken order.
    const order = await Order.findOneAndUpdate(
      {
        ...this.getOrderQuery(orderId),
        status: { $in: [OrderStatus.SEARCHING_DRIVER, OrderStatus.CREATED] },
        dispatchMode: { $ne: "broadcast" },
        // A top-up is applied once, however many times its payment is settled.
        ...(opts.topupPaymentId ? { topupPayments: { $ne: opts.topupPaymentId } } : {}),
      },
      [
        {
          $set: {
            customerPrice: { $add: [{ $ifNull: ["$customerPrice", "$totalPrice"] }, raise] },
            totalPrice: { $add: [{ $ifNull: ["$customerPrice", "$totalPrice"] }, raise] },
            "priceBreakdown.total": { $add: [{ $ifNull: ["$customerPrice", "$totalPrice"] }, raise] },
            // A new search round: its own passes, its own candidate count, no expiry yet.
            declineReasons: [],
            searchExhaustedAt: null,
            ...(opts.topupPaymentId
              ? { topupPayments: { $concatArrays: [{ $ifNull: ["$topupPayments", []] }, [opts.topupPaymentId]] } }
              : {}),
          },
        },
      ],
      { new: true, updatePipeline: true },
    ).populate("user").populate("vendor");
    if (!order) return null;

    const newPrice = order.customerPrice || order.totalPrice;
    const user = order.user as any;
    const vendor = order.vendor as any;

    if (order.status === OrderStatus.SEARCHING_DRIVER) {
      // Restart the sequential cascade at the new price rather than broadcasting to every
      // driver: a blanket broadcast bypassed the dispatch session, so two drivers could be
      // looking at the same task while the cascade carried on offering the OLD price.
      this.redispatch(order, user, vendor).catch((err) =>
        console.error("[orders.increasePrice] Failed to re-dispatch at the new price:", err),
      );
    }

    SocketManager.getInstance()?.emitToOrderRoom(order._id.toString(), "order_price_update", {
      orderId: order._id.toString(),
      price: newPrice,
    });

    return order;
  }

  /** A new sequential search for an order, with the real distances and the order's own details. */
  private async redispatch(order: any, user: any, vendor: any) {
    const { DriverService } = require("../drivers/drivers.service");
    const driversService = new DriverService();
    const [lng, lat] = order.stops[0].location.coordinates;

    let candidates = await driversService.getNearbyDrivers(lat, lng, undefined, order.serviceType, true);
    if (candidates.length === 0) {
      const fallbackQuery: any = { status: DriverStatus.ONLINE, isAvailable: true };
      // Mapped, not raw — see mapServiceTypeToDriverVehicleType's comment:
      // Driver.vehicleType has no "cab"/"cab_prime" value.
      const fallbackVehicleType = mapServiceTypeToDriverVehicleType(order.serviceType);
      if (fallbackVehicleType) {
        fallbackQuery.vehicleType = fallbackVehicleType;
      }
      candidates = await Driver.find(fallbackQuery).populate("user");
      // Same staleness rule as everywhere else this pattern appears — see
      // filterDriversWithLiveLocation's comment in drivers.service.ts.
      candidates = driversService.filterDriversWithLiveLocation(candidates, "increasePrice fallback");
      // Same for the service-toggle check — see driverAcceptsServiceType's comment.
      candidates = candidates.filter((d: any) => driverAcceptsServiceType(d.activeServices, order.serviceType));
    }

    const sorted = this.sortCandidatesNearestFirst(candidates, lat, lng);
    await Order.updateOne({ _id: order._id }, { totalCandidatesCount: sorted.length });

    const payload = this.buildDriverOfferPayload(order, user, {
      distance: `${order.totalDistance || 0} km`,
      duration: order.duration ? `${order.duration} hrs` : "ASAP",
      vendorName: vendor?.name,
      vendorPhone: vendor?.phone,
    });

    const { dispatchManager } = require("../../services/dispatch.manager");
    await dispatchManager.startDispatch(order._id.toString(), sorted, {
      ...payload,
      customerUserId: (user?._id || order.user)?.toString(),
    });
  }

  /**
   * `opts.reason` / `opts.customerMessage`: why the system cancelled it (food orders),
   * sent to the apps and used as the customer's notification text.
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    opts: { reason?: string; customerMessage?: string; actor?: string } = {},
  ) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");
    if (opts.reason && status === OrderStatus.CANCELLED) order.cancelReason = opts.reason;

    // Helper tasks follow one path (helper.flow.ts). Server-side callers (sweeps, admin tools)
    // pass no actor and act as staff.
    const helper = isHelperOrder(order);
    if (helper) {
      assertHelperTransition(order.status, status, opts.actor ?? "staff");
      if (isHelperStart(status) && !order.taskStartedAt) order.taskStartedAt = new Date();
      if (isHelperDone(status) && !order.taskCompletedAt) order.taskCompletedAt = new Date();
    }

    // Food orders: "ready" needs the restaurant's accept first, happens once, and
    // before a rider is assigned it doesn't touch the status at all.
    if (order.dispatchMode === "broadcast" && isReadyStatus(status)) {
      if (!order.restaurantAcceptedAt) throw new ConflictError("Accept the order before marking it ready.");
      if (order.foodReadyAt) {
        return Order.findOne(this.getOrderQuery(orderId)).populate("user").populate("driver").populate("vendor");
      }
      if (!order.driver) return this.markFoodReadyBeforeRider(order);
      order.foodReadyAt = new Date();
    } else if (order.vendor && isReadyStatus(status) && !order.foodReadyAt) {
      // Other outlet orders (meat shops) record it too: the rider's pickup code
      // unlocks on this, and it survives the rider's own status updates.
      order.foodReadyAt = new Date();
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      order.status = status;
      await order.save({ session });

      const isFinishedStatus = [
        OrderStatus.COMPLETED,
        OrderStatus.DELIVERED,
        OrderStatus.DELIVERED_LC,
        OrderStatus.CANCELLED
      ].includes(status) || 
      status.toLowerCase() === "completed" || 
      status.toLowerCase() === "delivered" || 
      status.toLowerCase() === "cancelled";

      if (isFinishedStatus && order.driver) {
        await Driver.findByIdAndUpdate(
          order.driver,
          { isAvailable: true },
          { session }
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    // An online-paid order that is now cancelled gets a real Razorpay refund (cash: skipped).
    if (status === OrderStatus.CANCELLED) {
      await this.refundIfPaidOnline(order._id.toString(), "order_cancelled");
      if (order.dispatchMode === "broadcast") await foodDispatch.cancelDispatch(order._id.toString());
      else {
        // Stop the sequential search and take the offer off the screen of whoever holds it.
        const { dispatchManager } = await import("../../services/dispatch.manager");
        dispatchManager.handleCustomerCancel(order._id.toString());
      }
    }

    const savedOrder = await Order.findOne(this.getOrderQuery(orderId));

    // Broadcast status change via Socket
    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      socketManager.emitToOrderRoom(orderId.toString(), "order_status_update", {
        orderId: orderId.toString(),
        status: status,
        ...(opts.reason ? { reason: opts.reason } : {}),
      });

      // ALSO emit to the customer's own room, under a distinct event — not
      // "order_status_update" again, which the tracking screen's global handler
      // applies unconditionally to whatever order it's currently displaying with
      // no orderId check, so replaying it into every customer's room would leak
      // one order's status onto another order's screen. The My Orders *list*
      // otherwise had no way to learn an order finished except by refetching on
      // screen focus, so a ride that completed while the customer was already
      // sitting on that tab kept showing "Track order" until they navigated away
      // and back.
      if (order.user) {
        socketManager.emitToUser(order.user.toString(), "customer_order_list_update", {
          orderId: orderId.toString(),
          status: status,
          ...(opts.reason ? { reason: opts.reason } : {}),
        });
      }

      // ALSO: if the order has a vendor, emit to the vendor room!
      if (order.vendor) {
        socketManager.emitToUser(order.vendor.toString(), "order_status_update_vendor", {
          orderId: orderId.toString(),
          status: status,
          ...(opts.reason ? { reason: opts.reason } : {}),
        });
      }

      // Broadcast order cancellation to all online drivers
      if (status === OrderStatus.CANCELLED) {
        socketManager.broadcastToDrivers("order_cancelled", {
          orderId: orderId.toString(),
        });
      }

      // The customer's helper screen moves on to tracking when the task starts.
      if (helper && isHelperStart(status)) {
        socketManager.emitToOrderRoom(orderId.toString(), "task_started", {
          orderId: orderId.toString(),
          taskStartedAt: order.taskStartedAt,
        });
      }
    }

    const populated = await Order.findOne(this.getOrderQuery(orderId)).populate("user").populate("driver").populate("vendor");

    // Send Push & In-app notifications based on status changes
    if (populated && populated.user) {
      try {
        let title = "";
        let body = "";
        const serviceName = populated.serviceType === ServiceType.DELIVERY ? "delivery" : helper ? "task" : "ride";

        if (helper && status !== OrderStatus.CANCELLED) {
          ({ title, body } = helperPushText(status));
        } else switch (status) {
          case OrderStatus.ARRIVED_PICKUP:
          case OrderStatus.ARRIVED_PICKUP_LC:
            if (populated.vendor) {
              // A restaurant / meat-shop order: "pickup" is the outlet, not the customer,
              // and its pickup code is between the rider and the restaurant.
              title = "Rider at the restaurant 🛵";
              body = "Your rider has reached the restaurant and will pick up your order as soon as it's ready.";
              break;
            }
            title = "Driver Arrived 🚖";
            body = `Your driver has arrived at your location. Give PIN ${populated.restaurantPickupCode || populated.deliveryOtp || ""} to start your ${serviceName} safely.`;
            break;
          case OrderStatus.ON_THE_WAY:
          case OrderStatus.IN_TRANSIT:
          case OrderStatus.EN_ROUTE_DELIVERY:
            title = populated.serviceType === ServiceType.DELIVERY ? "Out for Delivery 📦" : "Trip Started 📍";
            body = populated.serviceType === ServiceType.DELIVERY 
              ? "Your items have been picked up and are on the way!" 
              : "Your ride is now in progress. Enjoy the journey!";
            break;
          case OrderStatus.COMPLETED:
          case OrderStatus.DELIVERED:
          case OrderStatus.DELIVERED_LC:
            title = populated.serviceType === ServiceType.DELIVERY ? "Order Delivered 🍔" : "Trip Completed 🎉";
            body = `Your ${serviceName} is complete. Thank you for choosing us! Please rate your experience.`;
            break;
          case OrderStatus.CANCELLED:
            title = "Order Cancelled ❌";
            body = `${opts.customerMessage || `Your ${serviceName} has been cancelled.`}${await this.refundNotice(populated._id.toString())}`;
            break;
        }

        if (title && body) {
          await NotificationService.getInstance().sendNotification({
            userId: populated.user._id.toString(),
            title,
            body,
            type: "transactional",
            category: "order_status",
            data: {
              orderId: populated._id,
              status: status,
              serviceType: populated.serviceType,
              deepLink: { screen: "/tracking", params: { orderId: populated._id.toString() } },
            }
          });
        }

        // Asynchronously send invoice if the order status is completed/delivered
        const isCompleted = [
          OrderStatus.COMPLETED,
          OrderStatus.DELIVERED,
          OrderStatus.DELIVERED_LC,
        ].includes(status) || 
        status.toLowerCase() === "completed" || 
        status.toLowerCase() === "delivered";

        if (isCompleted) {
          InvoiceService.getInstance().sendInvoice(orderId).catch(err => {
            console.error(`[orders.service] Failed to send invoice for order ${orderId}:`, err);
          });
        }
      } catch (err) {
        console.error("[orders.service] Error sending status update notification:", err);
      }
    }

    return populated || savedOrder || order;
  }

  /**
   * Stop items are persisted as `{ lines: [...] }` (see createOrder), which is awkward for a
   * client that just wants "what was ordered". This flattens every stop's lines into one
   * array of `{ id, name, quantity, price, ... }` — what reorder needs.
   */
  extractOrderItems(order: any): any[] {
    const stops = Array.isArray(order?.stops) ? order.stops : [];
    const lines: any[] = [];

    for (const stop of stops) {
      const raw = stop?.items;
      const stopLines = Array.isArray(raw) ? raw : Array.isArray(raw?.lines) ? raw.lines : [];
      for (const line of stopLines) {
        if (!line) continue;
        lines.push({
          ...line,
          id: String(line.id ?? line._id ?? line.itemId ?? ""),
          name: line.name ?? "",
          quantity: Math.max(1, Math.round(Number(line.quantity) || 1)),
          price: Number(line.price) || 0,
        });
      }
    }

    return lines;
  }

  async getUserOrders(userId: string) {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    const outlets = await this.outletSummaries(orders.map((order: any) => order.vendor));
    return orders.map((order: any) => ({
      ...order,
      // The outlet's name, photo and type ride along so the order list can show the
      // restaurant / meat shop picture and tell food from meat. Falls back to the bare
      // id when the outlet no longer exists, which is what this field used to be.
      vendor: (order.vendor && outlets.get(String(order.vendor))) || order.vendor,
      items: this.extractOrderItems(order),
    }));
  }

  /**
   * `{ _id, name, image, partnerType }` per outlet id, looked up in one query per
   * collection. An order's `vendor` is either a restaurant (Vendor) or a legacy meat
   * centre (MeatCenter), and the id alone doesn't say which.
   */
  private async outletSummaries(ids: any[]) {
    const unique = [...new Set(ids.filter(Boolean).map(String))];
    const summaries = new Map<string, { _id: string; name?: string; image?: string; partnerType: "food" | "meat" }>();
    if (!unique.length) return summaries;

    const [vendors, meatCenters] = await Promise.all([
      Vendor.find({ _id: { $in: unique } }).select("name image partnerType").lean(),
      MeatCenter.find({ _id: { $in: unique } }).select("name image").lean(),
    ]);
    for (const v of vendors as any[]) {
      summaries.set(String(v._id), { _id: String(v._id), name: v.name, image: v.image, partnerType: v.partnerType === "meat" ? "meat" : "food" });
    }
    for (const m of meatCenters as any[]) {
      summaries.set(String(m._id), { _id: String(m._id), name: m.name, image: m.image, partnerType: "meat" });
    }
    return summaries;
  }

  /**
   * The items of a past order, in the exact shape the cart stores them. Used by reorder.
   */
  async getReorderPayload(orderId: string, userId: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId)).lean();
    if (!order) throw new Error("Order not found");
    if (order.user?.toString() !== userId.toString()) {
      throw new ValidationError("You can only reorder your own orders");
    }

    const lines = this.extractOrderItems(order).filter((line) => line.id);
    const items = lines.map((line) => ({
      itemId: line.id,
      _id: line.id,
      name: line.name,
      description: line.description ?? "",
      price: line.price,
      category: line.category ?? "",
      isVeg: line.isVeg !== false,
      image: line.image,
      images: line.images,
      quantity: line.quantity,
    }));

    return {
      orderId: order._id,
      vendorId: order.vendor ? order.vendor.toString() : null,
      items,
    };
  }

  /**
   * Rebuilds the caller's server cart from a past order and returns the new cart, so the app
   * can reorder in a single request instead of replaying add-item calls.
   */
  async reorderIntoCart(orderId: string, userId: string) {
    const { vendorId, items } = await this.getReorderPayload(orderId, userId);
    if (!items.length) {
      throw new ValidationError("This order has no items to reorder");
    }

    return this.cartService.saveCart(userId, vendorId, items);
  }

  /**
   * An outlet's orders, newest first.
   *   - no options: the whole history (the web vendor panel);
   *   - `since`: the live set — everything created since then, plus any older order still in progress;
   *   - `before` + `limit`: one page of history, for infinite scroll.
   * The windowed forms are the partner app's, and populate only the customer's name and phone.
   */
  async getVendorOrders(vendorId: string, options: { since?: Date; before?: Date; limit?: number } = {}) {
    const { since, before, limit } = options;
    const windowed = !!(since || before || limit);
    const filter: Record<string, unknown> = { vendor: vendorId };
    if (since) {
      const finished = [OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC, OrderStatus.COMPLETED, OrderStatus.CANCELLED, "completed", "cancelled"];
      filter.$or = [{ createdAt: { $gte: since } }, { status: { $nin: finished } }];
    }
    if (before) filter.createdAt = { $lt: before };

    const query = Order.find(filter)
      .populate("user", windowed ? "name phone" : undefined)
      .sort({ createdAt: -1 });
    return limit ? query.limit(limit) : query;
  }

  async declineOrder(orderId: string, driverUserId: string, reason: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");

    const driver = await Driver.findOne({ user: driverUserId });
    if (!driver) throw new Error("Driver profile not found");

    // Push the reason
    if (!order.declineReasons) {
      order.declineReasons = [];
    }
    
    // Prevent duplicate declining from the same driver
    const alreadyDeclined = order.declineReasons.some(r => r.driverId === driver._id.toString());
    if (!alreadyDeclined) {
      order.declineReasons.push({ driverId: driver._id.toString(), reason });
      await order.save();
    }

    // Average of all drivers or helpers opinion
    // E.g., if 2 or more drivers declined, find the most common reason
    if (order.declineReasons.length >= 2) {
      const reasonCounts = order.declineReasons.reduce((acc, r) => {
        acc[r.reason] = (acc[r.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      let mostCommonReason = "";
      let maxCount = 0;
      for (const [r, count] of Object.entries(reasonCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostCommonReason = r;
        }
      }

      if (maxCount >= 2) { // At least 2 drivers agree on the exact same reason
        // Send a socket event to the customer
        const socketManager = SocketManager.getInstance();
        if (socketManager) {
          socketManager.emitToUser(order.user.toString(), "order_delayed_reason", {
            orderId: order._id,
            reason: mostCommonReason
          });
        }
      }
    }

    if (order.dispatchMode === "broadcast") {
      // Everyone in range was asked at once, so there's no next driver to hand it to.
      await foodDispatch.declineOffer(order._id.toString(), driverUserId, reason);
    } else {
      // Trigger dispatch manager to pass order to next nearest driver in sequence
      const { dispatchManager } = require("../../services/dispatch.manager");
      await dispatchManager.handleDriverDecline(orderId, driverUserId);
    }

    return order;
  }

  /**
   * The job a driver is on right now, so the app can bring it back after a restart
   * (it only held it in memory). Same rule as "busy" in food dispatch: not finished,
   * touched in the last 6 hours, and not a reserved ride still waiting for its time.
   * Populated like acceptOrder's answer, which is what the app maps.
   */
  async getDriverActiveOrder(driverUserId: string) {
    const driver = await Driver.findOne({ user: driverUserId }).select("_id").lean();
    if (!driver) return null;
    const now = new Date();
    return Order.findOne({
      driver: driver._id,
      status: {
        $nin: [
          OrderStatus.CREATED, OrderStatus.SEARCHING_DRIVER, OrderStatus.CONFIRMED,
          OrderStatus.COMPLETED, OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC, OrderStatus.CANCELLED,
          "completed", "cancelled",
        ],
      },
      updatedAt: { $gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
      $nor: [{ isReserved: true, reservedAt: { $gt: now } }],
    })
      .sort({ updatedAt: -1 })
      .populate("user")
      .populate("driver")
      .populate("vendor");
  }

  /**
   * The customer confirms the task to the helper who accepted it (the "assign task" row in
   * chat). Saved, so the helper's Start button unlocks even if their chat wasn't open.
   */
  async confirmHelperAssign(orderId: string, customerUserId: string) {
    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");
    if (order.user.toString() !== customerUserId) throw new Error("Order not found");
    if (!isHelperOrder(order)) throw new ConflictError("Only a helper task is assigned in chat.");
    if (order.status !== OrderStatus.DRIVER_ASSIGNED && order.status !== OrderStatus.IN_PROGRESS) {
      throw new ConflictError("This task has no helper to assign it to.");
    }
    if (!order.assignConfirmedAt) {
      order.assignConfirmedAt = new Date();
      await order.save();
    }

    const payload = { orderId: order._id.toString(), assignConfirmedAt: order.assignConfirmedAt };
    const socketManager = SocketManager.getInstance();
    socketManager?.emitToOrderRoom(order._id.toString(), "assign_task_confirmed", payload);
    const driver = order.driver ? await Driver.findById(order.driver).select("user").lean() : null;
    if (driver?.user) socketManager?.emitToDriver(driver.user.toString(), "assign_task_confirmed", payload, "orders.confirmHelperAssign");
    return payload;
  }

  /**
   * The dispatcher offered a helper task to everyone and nobody took it. The customer can still
   * raise the price; if they don't, the expiry sweep cancels it after `expiryMinutes`.
   */
  async markHelperSearchExhausted(orderId: string) {
    await Order.updateOne(
      { _id: orderId, serviceType: ServiceType.HELPER, status: OrderStatus.SEARCHING_DRIVER, searchExhaustedAt: null },
      { $set: { searchExhaustedAt: new Date() } },
    );
  }

  /**
   * Cancels (and refunds) helper tasks nobody took: those whose search ran out more than
   * `expiryMinutes` ago, and those this process lost track of after a restart (still searching,
   * no dispatch session, not touched for a while).
   */
  async expireStaleHelperSearches() {
    const { expiryMinutes } = await this.pricingService.getHelperRates();
    const now = Date.now();
    const expiryMs = Math.max(1, expiryMinutes) * 60 * 1000;
    const { dispatchManager } = await import("../../services/dispatch.manager");

    const searching: any[] = await Order.find({ serviceType: ServiceType.HELPER, status: OrderStatus.SEARCHING_DRIVER })
      .select("_id searchExhaustedAt updatedAt")
      .limit(200)
      .lean();

    for (const row of searching) {
      const id = String(row._id);
      const exhaustedAt = row.searchExhaustedAt ? new Date(row.searchExhaustedAt).getTime() : null;
      const orphaned = !exhaustedAt && !dispatchManager.isDispatching(id) && now - new Date(row.updatedAt).getTime() > expiryMs;
      if (orphaned) {
        // Lost on a restart: give the customer the same window to raise the price as a search that ran out.
        await this.markHelperSearchExhausted(id);
        SocketManager.getInstance()?.emitToOrderRoom(id, "no_drivers_available", { orderId: id, message: "No helpers available right now." });
        continue;
      }
      if (exhaustedAt && now - exhaustedAt >= expiryMs) {
        try {
          await this.updateOrderStatus(id, OrderStatus.CANCELLED, {
            reason: "no_helpers",
            customerMessage: "No helper was available for your task, so we've cancelled it.",
          });
        } catch (err: any) {
          console.error(`[orders.service] Failed to expire helper task ${id}:`, err?.message);
        }
      }
    }
  }

  async acceptOrder(orderId: string, driverUserId: string) {
    if (!orderId) {
      throw new Error("Invalid order ID");
    }

    const driver = await Driver.findOne({ user: driverUserId });
    if (!driver) throw new Error("Driver profile not found");

    const order = await Order.findOne(this.getOrderQuery(orderId));
    if (!order) throw new Error("Order not found");

    if (order.dispatchMode === "broadcast") {
      // Food orders are offered to many riders at once: one atomic claim decides who
      // gets it, and everyone else is told it's gone (foodDispatch.claimOffer).
      await foodDispatch.claimOffer(order._id.toString(), driverUserId, driver._id);
      await Driver.updateOne({ _id: driver._id }, { isAvailable: false });
      SocketManager.getInstance()?.emitToUser(order.vendor!.toString(), "order_status_update_vendor", {
        orderId: order._id.toString(),
        status: OrderStatus.DRIVER_ASSIGNED,
      });
    } else {
      if (order.status !== OrderStatus.SEARCHING_DRIVER && !(order.isReserved && order.status === OrderStatus.CREATED)) {
        throw new Error("Order is no longer available");
      }

      // Notify dispatch manager that order was accepted to stop cascade timers
      const { dispatchManager } = require("../../services/dispatch.manager");
      dispatchManager.handleDriverAccept(orderId, driverUserId);

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        order.driver = driver._id;
        order.status = OrderStatus.DRIVER_ASSIGNED;
        await order.save({ session });

        driver.isAvailable = false;
        await driver.save({ session });

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

      // A driver who just took a ride/task is no longer free for a food offer they were holding.
      foodDispatch.closeOffersForDriver(driverUserId).catch((err) =>
        console.warn("[orders.service] Failed to close food offers for a busy driver:", err?.message),
      );
    }

    const savedOrder = await Order.findOne(this.getOrderQuery(orderId));

    // Broadcast to the customer that order is accepted
    const socketManager = SocketManager.getInstance();
    if (socketManager) {
      // Driver details to send to customer
      const driverUser = await User.findById(driver.user);
      // Same shape the customer app gets from GET /orders/:id, rating included, so
      // the tracking sheet shows the same partner card whether it arrived over the
      // socket or from a refetch.
      const driverInfo = {
        id: driver._id,
        name: driverUser?.name || "Driver",
        phone: driverUser?.phone || "",
        vehicle: driver.vehicleType || "unknown",
        ...(await getDriverRating(driver._id)),
      };
      
      const payload = {
        orderId: orderId.toString(),
        driver: driverInfo,
        isReserved: order.isReserved,
        reservedAt: order.reservedAt,
      };

      console.log(
        `[ORDER][SOCKET][DRIVER_ACCEPTED] order=${orderId} driverUser=${driverUserId} ` +
        `customerUser=${order.user?.toString() || "unknown"} driverProfile=${driver._id}`
      );
      socketManager.logConnectionStatus("before_driver_accept_emit", order.user?.toString(), driverUserId, orderId.toString());
      socketManager.emitToOrderRoom(orderId.toString(), "order_accepted", payload, "orders.acceptOrder");

      // Also emit directly to the customer's user room
      if (order.user) {
        socketManager.emitToUser(order.user.toString(), "order_accepted", payload, "orders.acceptOrder.customer");
      }
      socketManager.logConnectionStatus("after_driver_accept_emit", order.user?.toString(), driverUserId, orderId.toString());
    }

    const populated = await Order.findOne(this.getOrderQuery(orderId)).populate("user").populate("driver").populate("vendor");

    // Send Push & In-app Notification to customer
    if (populated && populated.user) {
      try {
        const driverUser = await User.findById(driver.user);
        const vehicleName = populated.serviceType === ServiceType.CAB ? "cab" : populated.serviceType === ServiceType.BIKE ? "bike" : populated.serviceType === ServiceType.AUTO ? "auto" : "delivery rider";
        const startPin = populated.restaurantPickupCode || populated.deliveryOtp;
        const pinText = startPin ? `. Share PIN ${startPin} to start your ride safely` : "";
        const helperText = isHelperOrder(populated) ? helperPushText(OrderStatus.DRIVER_ASSIGNED, driverUser?.name) : null;

        await NotificationService.getInstance().sendNotification({
          userId: populated.user._id.toString(),
          title: helperText?.title || "Driver Assigned 🚖",
          body: helperText?.body || `${driverUser?.name || "A driver"} has accepted your request. Your ${vehicleName} is arriving${pinText}.`,
          type: "transactional",
          category: "order_status",
          data: {
            orderId: populated._id,
            status: OrderStatus.DRIVER_ASSIGNED,
            serviceType: populated.serviceType,
            deepLink: { screen: "/tracking", params: { orderId: populated._id.toString() } },
          }
        });
      } catch (err) {
        console.error("[orders.service] Error sending driver assignment notification:", err);
      }
    }

    return populated || savedOrder || order;
  }

  async triggerOrderSOS(orderId: string, userId: string): Promise<boolean> {
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "driver",
        populate: { path: "user" }
      });
      
    if (!order) throw new Error("Order not found");

    const passengerUser = order.user as any;
    const driverObj = order.driver as any;
    const driverUser = driverObj?.user as any;

    // Check permissions: either passenger or driver must be triggering this
    if (passengerUser?._id.toString() !== userId && driverUser?._id.toString() !== userId) {
      throw new Error("Unauthorized to trigger SOS for this order");
    }

    const passengerName = passengerUser?.name || "Passenger";
    const driverName = driverUser?.name || "Unassigned";

    // 1. Generate unique ticketId for SupportTicket
    const ticketId = `SOS-${orderId}-${Date.now().toString().slice(-4)}`;

    const supportTicket = new SupportTicket({
      ticketId,
      title: `EMERGENCY SOS: Order ${orderId}`,
      category: "EMERGENCY SOS",
      status: "OPEN",
      message: `SOS emergency triggered by ${userId === passengerUser?._id.toString() ? 'Passenger' : 'Driver'}. Order: ${orderId}. Driver: ${driverName}. Customer: ${passengerName}.`,
      user: passengerName,
      time: "Just now",
      messages: [
        {
          sender: "system",
          time: new Date().toISOString(),
          text: `🚨 SOS Triggered by user. Emergency details shared with admins. GPS Coordinates: ${order.stops[0]?.location?.coordinates?.join(', ') || 'N/A'}`
        }
      ]
    });
    await assignAndSaveTicket(supportTicket);
    emitTicketUpdate(supportTicket);

    // 2. Query all Admin users
    const admins = await User.find({ role: "ADMIN" });

    // 3. Dispatch Push & In-app alerts to all admins
    const notificationService = NotificationService.getInstance();
    for (const admin of admins) {
      try {
        await notificationService.sendNotification({
          userId: admin._id.toString(),
          title: "🚨 EMERGENCY SOS ALERT 🚨",
          body: `${passengerName} has triggered an SOS emergency on ride ${orderId}. Driver: ${driverName}.`,
          type: "alert",
          category: "system",
          data: {
            orderId,
            ticketId,
            type: "sos",
            passengerName,
            driverName,
            deepLink: { app: "admin", screen: `/support/chats/${supportTicket._id.toString()}` },
          }
        });
      } catch (err) {
        console.error(`[orders.service] SOS notification failed for admin ${admin._id}:`, err);
      }
    }

    // 4. Also notify driver if passenger triggers, or passenger if driver triggers
    const triggeredByPassenger = userId === passengerUser?._id.toString();
    const receiverUserId = triggeredByPassenger ? driverUser?._id?.toString() : passengerUser?._id?.toString();
    if (receiverUserId) {
      try {
        await notificationService.sendNotification({
          userId: receiverUserId,
          title: "Emergency Alert Triggered 🚨",
          body: "SOS has been triggered for this trip. Emergency contacts and authorities are being notified.",
          type: "alert",
          category: "system",
          data: {
            orderId,
            type: "sos",
            // Receiver is the driver when the passenger triggered SOS, and vice versa.
            deepLink: triggeredByPassenger
              ? { screen: "/active-order", params: { orderId: orderId.toString() } }
              : { screen: "/tracking", params: { orderId: orderId.toString() } },
          }
        });
      } catch (err) {
        console.error(`[orders.service] SOS peer alert failed:`, err);
      }
    }

    return true;
  }
}
