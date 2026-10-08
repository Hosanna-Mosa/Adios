import { Request, Response, NextFunction } from "express";
import { OrdersService } from "./orders.service";
import { isPackageDeliveryOrder, withoutDriverSecrets } from "./orders.packageDelivery";
import { AuthRequest } from "../../middleware/auth.middleware";
import Order, { OrderStatus, ServiceType } from "../../database/models/Order";
import { UserRole } from "../../database/models/User";
import Driver from "../../database/models/Driver";
import { CouponsService } from "../coupons/coupons.service";
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } from "../../utils/errors";
import { InvoiceService } from "../../services/invoice.service";
import { getDriverRating } from "../reviews/driver-rating";
import * as foodDispatch from "../../services/foodDispatch.service";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import mongoose from "mongoose";

/**
 * The outlet behind a food / meat order, by the id in `order.vendor` (a Vendor, or a
 * legacy MeatCenter). Null for orders without one (rides, courier, helper).
 */
async function outletSummary(vendorRef: unknown): Promise<{ name: string; partnerType: string } | null> {
  const id = String((vendorRef as any)?._id ?? vendorRef ?? "");
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const vendor: any = await Vendor.findById(id).select("name partnerType").lean();
  if (vendor) return { name: vendor.name, partnerType: vendor.partnerType || "food" };
  const meat: any = await MeatCenter.findById(id).select("name").lean();
  return meat ? { name: meat.name, partnerType: "meat" } : null;
}

const ordersService = new OrdersService();
const couponsService = new CouponsService();

// Delivery and pickup codes are 4-digit strings minted per order in
// OrdersService.createOrder. Compared as trimmed strings so a client that sends
// the code as a JSON number still matches, and so a missing or blank submission
// is a mismatch rather than an accidental pass. There is deliberately no master
// code: one would unlock every order on the platform, and since the generator's
// range is 1000-9999 any master value is also a code a real order can be given.
const verificationCodeMatches = (supplied: unknown, expected: string): boolean => {
  if (typeof expected !== "string" || expected.trim().length === 0) return false;
  if (typeof supplied !== "string" && typeof supplied !== "number") return false;
  return String(supplied).trim() === expected.trim();
};

// Accepts a populated document, a raw ObjectId or a string, since whether a ref
// arrives populated depends on which query loaded the order.
const refId = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

// An order carries the customer's name and phone, the pickup and drop addresses,
// and the delivery OTP that completes it. Reading one is therefore limited to the
// people actually party to it — the customer, the assigned driver, the vendor
// fulfilling it — plus platform staff. Vendor and meat-centre tokens carry the
// Vendor/MeatCenter _id as userId with a role outside UserRole, which is why the
// vendor arm compares against order.vendor rather than a user id.
const canReadOrder = (order: any, user?: { userId: string; role: string }): boolean => {
  if (!user?.userId) return false;
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) return true;

  return (
    user.userId === refId(order.user) ||
    user.userId === refId(order.driver?.user) ||
    user.userId === refId(order.vendor)
  );
};

// A vendor's order list carries every customer's populated User document, so it
// is readable only by that vendor and by platform staff. A vendor or meat-centre
// token carries the Vendor/MeatCenter _id as its subject, which is the same id
// these routes take in the path — so the two compare directly.
const canAccessVendorData = (vendorId: string, user?: { userId: string; role: string }): boolean => {
  if (!user?.userId || !vendorId) return false;
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) return true;
  return user.userId === vendorId;
};

/** cancelReason + the customer's notification text, by who cancelled the order. */
const CANCEL_BY: Record<string, { reason: string; customerMessage?: string }> = {
  vendor: { reason: "restaurant_rejected", customerMessage: "The restaurant couldn't take your order, so it has been cancelled." },
  driver: { reason: "driver_cancelled", customerMessage: "Your rider had to cancel, so this order has been cancelled." },
  staff: { reason: "admin_cancelled", customerMessage: "The Adios team cancelled this order." },
  customer: { reason: "customer_cancelled" },
};

export class OrdersController {
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, cartTotal } = req.body;
      if (!code) {
        throw new ValidationError("Promo code is required");
      }

      const orderTotal = Number(cartTotal) || 0;
      const { coupon, discountAmount } = await couponsService.resolveForCart(code, orderTotal, req.body.vendorId);

      return res.json({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
        discountAmount,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async estimateFare(req: Request, res: Response, next: NextFunction) {
    try {
      const { pickupLat, pickupLng, dropLat, dropLng, serviceType } = req.query;

      const parsedPickupLat = Number(pickupLat);
      const parsedPickupLng = Number(pickupLng);
      const parsedDropLat = Number(dropLat);
      const parsedDropLng = Number(dropLng);
      const parsedServiceType = String(serviceType || ServiceType.CAB) as ServiceType;

      const estimate = await ordersService.estimateFare(
        parsedPickupLat,
        parsedPickupLng,
        parsedDropLat,
        parsedDropLng,
        parsedServiceType,
      );

      return res.json(estimate);
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { stops, serviceType, vendorId, totals, radius, duration, isReserved, reservedAt, customerPrice, bookingFor, scheduledDelivery, scheduledFor, couponCode, packageDelivery } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const order = await ordersService.createOrder(userId, stops, serviceType, vendorId, totals, radius, duration, isReserved, reservedAt, {
        customerPrice,
        bookingFor,
        scheduledDelivery,
        scheduledFor,
        couponCode,
        packageDelivery,
      });

      return res.status(201).json(order);
    } catch (error: any) {
      next(error);
    }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Only the order's customer, assigned driver, vendor, or staff (otherwise "not found").
      const { order, relation } = await ordersService.getOrderForActor(id as string, req.user);
      // The tracking screen reads the assigned driver's name, phone and vehicle off
      // this payload, so the driver (and its user) has to be populated here.
      await order.populate({ path: "driver", populate: { path: "user", select: "name phone" } });

      // Answers 404 rather than 403 so that order ids cannot be probed for
      // existence by a caller who is not party to them.
      if (!canReadOrder(order, req.user)) {
        throw new NotFoundError("Order not found");
      }

      // The driver's star rating lives in the Review collection, not on the Driver
      // document, so it has to be attached here for the tracking screen to show it.
      const json: any = { ...order.toJSON(), items: ordersService.extractOrderItems(order) };
      if (json.driver?._id) {
        json.driver = { ...json.driver, ...(await getDriverRating(json.driver._id)) };
      }
      // The tracking screen names the restaurant and draws it (and the delivery home)
      // as such. Added alongside `vendor`, which stays the bare id other callers expect.
      if (json.vendor) json.outlet = await outletSummary(json.vendor);
      // A package delivery's OTP is the receiver's to give — never the driver's to read.
      if (relation === "driver" && isPackageDeliveryOrder(json)) delete json.deliveryOtp;
      return res.json(json);
    } catch (error) {
      next(error);
    }
  }

  async getChatHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("User is not authenticated");

      const messages = await ordersService.getChatHistory(id as string, userId);
      return res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Same access rule as the order itself.
      await ordersService.getOrderForActor(id as string, req.user);

      const populatedOrder = await Order.findById(id)
        .populate("user")
        .populate({
          path: "driver",
          populate: { path: "user" }
        })
        .populate("vendor");

      if (!populatedOrder) {
        throw new NotFoundError("Order not found");
      }

      // The invoice renders the customer's name, phone and both addresses, so it
      // is gated to the same parties as the order itself.
      if (!canReadOrder(populatedOrder, req.user)) {
        throw new NotFoundError("Order not found");
      }

      let invoiceHtml = "";
      if (populatedOrder.serviceType === ServiceType.DELIVERY) {
        invoiceHtml = InvoiceService.getInstance().generateDeliveryInvoiceHtml(populatedOrder);
      } else if (populatedOrder.serviceType === ServiceType.HELPER) {
        invoiceHtml = InvoiceService.getInstance().generateTaskInvoiceHtml(populatedOrder);
      } else {
        invoiceHtml = InvoiceService.getInstance().generateRideInvoiceHtml(populatedOrder);
      }

      res.setHeader("Content-Type", "text/html");
      return res.send(invoiceHtml);
    } catch (error) {
      next(error);
    }
  }

  async requestScheduledDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { vendorId, scheduledFor } = req.body;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const request = await ordersService.requestScheduledDelivery(userId, vendorId, scheduledFor);
      return res.status(202).json(request);
    } catch (error: any) {
      next(error);
    }
  }

  async getScheduledOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await ordersService.getScheduledOrders();
      return res.json(orders);
    } catch (error: any) {
      next(error);
    }
  }

  async respondToOrderSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      const result = await ordersService.respondToOrderSchedule(id as string, action, reason);
      return res.json(result);
    } catch (error: any) {
      if (error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const cart = await ordersService.reorderIntoCart(id as string, userId);
      return res.json(cart);
    } catch (error: any) {
      if (error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async getVendorScheduledDeliveries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      if (!ordersService.canActForVendor(String(vendorId), req.user)) throw new NotFoundError("Vendor not found");

      if (!canAccessVendorData(vendorId as string, req.user)) {
        throw new ForbiddenError("You do not have access to this vendor's orders");
      }

      const requests = await ordersService.getVendorScheduledDeliveryRequests(vendorId as string);
      return res.json(requests);
    } catch (error: any) {
      next(error);
    }
  }

  async getScheduledDeliveryStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { requestId } = req.params;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }
      const status = await ordersService.getScheduledDeliveryRequestStatus(requestId as string, userId);
      return res.json(status);
    } catch (error: any) {
      if (error.message === "Scheduled delivery request not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async respondScheduledDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { accepted, reason } = req.body;
      // A vendor answers only for its own outlet: the id comes from the token, never the body.
      // Admins may answer on a vendor's behalf with the vendorId they send. Support
      // is view-only: canActForVendor lets them read a vendor's requests, not answer them.
      const role = String(req.user?.role || "");
      if (role === UserRole.SUPPORT) {
        throw new ForbiddenError("Support can view scheduled deliveries but not respond to them.");
      }
      const isStaff = role === UserRole.ADMIN;
      const vendorId = isStaff ? req.body.vendorId : req.user?.userId;
      if (!vendorId || !ordersService.canActForVendor(String(vendorId), req.user)) {
        throw new NotFoundError("Scheduled delivery request not found");
      }

      const result = await ordersService.respondToScheduledDelivery(requestId as string, vendorId, accepted, reason);
      return res.json(result);
    } catch (error: any) {
      if (error.message === "Scheduled delivery request not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async increasePrice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const amount = Number(req.body.amount);
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      if (!amount || amount <= 0) {
        throw new ValidationError("Invalid amount to increase");
      }

      const order = await ordersService.increaseOrderPrice(id as string, amount, userId);
      return res.json(order);
    } catch (error: any) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, otp } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        throw new ValidationError("Invalid status value");
      }

      // Who may move this order, and where to. Strangers get "not found".
      const { order: current, relation } = await ordersService.getOrderForActor(id as string, req.user);
      // Support staff can look orders up to help customers, but only admins change them.
      if (relation === "staff" && req.user?.role === UserRole.SUPPORT) {
        throw new ForbiddenError("Support can view orders but not change them.");
      }
      const isCancel = String(status).toUpperCase() === OrderStatus.CANCELLED;
      if (relation === "customer" && !isCancel) {
        throw new ForbiddenError("You can only cancel your own order.");
      }
      if (relation === "vendor" && !isCancel && String(status).toLowerCase() !== OrderStatus.PICKING_ITEMS_LC) {
        throw new ForbiddenError("A restaurant can only mark an order ready or cancel it.");
      }

      // If updating to DELIVERED status, verify the customer delivery OTP
      const isDeliveredStatus = 
        status === OrderStatus.DELIVERED || 
        status === OrderStatus.DELIVERED_LC || 
        status.toLowerCase() === "delivered" || 
        status.toLowerCase() === "completed";

      if (isDeliveredStatus) {
        const orderObj = await ordersService.getOrderById(id as string);
        // A cash order can only be completed after the driver confirmed collecting the cash.
        // ($isDefault: orders created before paymentMethod existed only get "cash" as a schema
        // default when loaded; they are not held back.)
        const storedCash = orderObj && orderObj.paymentMethod === "cash" && !orderObj.$isDefault("paymentMethod");
        if (storedCash && !orderObj.cashCollected) {
          throw new ConflictError("Confirm the cash you collected before completing this order.");
        }
        // Restaurant / meat-shop orders and rides finish without the customer's OTP
        // (a ride still starts with its PIN); package deliveries and helper tasks still need it.
        // A package delivery is stored as a bike/auto ride, but it always ends with the
        // receiver's OTP — that is the only proof the package reached the right person.
        const isPackageDelivery = isPackageDeliveryOrder(orderObj);
        const isRide = [ServiceType.BIKE, ServiceType.AUTO, ServiceType.CAB, ServiceType.CAB_PRIME].includes(orderObj?.serviceType as ServiceType);
        if (orderObj && orderObj.deliveryOtp && !orderObj.vendor && (!isRide || isPackageDelivery)) {
          if (!verificationCodeMatches(otp, orderObj.deliveryOtp)) {
            throw new ValidationError(
              isPackageDelivery
                ? "Invalid delivery OTP. Ask the receiver for the 4-digit code the sender shared with them."
                : "Invalid delivery verification OTP. Please ask the customer for the correct code."
            );
          }
        }
      }

      // If updating to EN_ROUTE_DELIVERY status (pickup completed), verify the restaurant pickup code
      const isPickupCompletedStatus = 
        status === OrderStatus.ON_THE_WAY || 
        status === OrderStatus.EN_ROUTE_DELIVERY || 
        status.toLowerCase() === "en_route_delivery" || 
        status.toLowerCase() === "picked_up";

      if (isPickupCompletedStatus) {
        const orderObj = await ordersService.getOrderById(id as string);
        // A rider can't collect an outlet order the kitchen hasn't marked ready
        // ("Mark as ready" in the partner app / vendor panel).
        const markedReady = !!orderObj?.foodReadyAt || String(orderObj?.status).toLowerCase() === OrderStatus.PICKING_ITEMS_LC;
        if (orderObj?.vendor && relation === "driver" && !markedReady) {
          throw new ConflictError("The restaurant hasn't marked this order ready yet. You can pick it up once they tap \"Mark as ready\".");
        }
        // A package delivery starts without a code: the captain collects the package and
        // goes. It is secured at the other end instead, by the receiver's delivery OTP.
        if (orderObj && (orderObj as any).restaurantPickupCode && !isPackageDeliveryOrder(orderObj)) {
          // Only the order's own code — no master code (RAZORPAY_INTEGRATION.md §5.4 A2/C1).
          if (!verificationCodeMatches(otp, (orderObj as any).restaurantPickupCode)) {
            throw new ValidationError("Invalid restaurant pickup code. Please ask the restaurant for the correct code.");
          }
        }
      }

      // Every cancellation records who made it, so the customer is told who
      // cancelled (the restaurant, the rider, the Adios team) — not a generic notice.
      const order = await ordersService.updateOrderStatus(id as string, status, isCancel ? CANCEL_BY[relation] : {});
      return res.json(relation === "driver" ? withoutDriverSecrets(order) : order);
    } catch (error: any) {
      if (error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async cashCollected(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("User is not authenticated");
      const order = await ordersService.confirmCashCollected(String(req.params.id), userId, Number(req.body.amount));
      return res.json(withoutDriverSecrets(order));
    } catch (error) {
      next(error);
    }
  }

  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const order = await ordersService.acceptOrder(id as string, userId);
      return res.json(withoutDriverSecrets(order));
    } catch (error: any) {
      if (error.message === "Order is no longer available") {
        return next(new ConflictError(error.message));
      }
      if (error.message === "Driver profile not found" || error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  /** The restaurant accepts a food order and quotes a prep time; the rider search starts here. */
  async restaurantAccept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { relation } = await ordersService.getOrderForActor(id as string, req.user);
      if (relation === "staff" && req.user?.role === UserRole.SUPPORT) {
        throw new ForbiddenError("Support can view orders but not change them.");
      }
      if (relation !== "vendor" && relation !== "staff") {
        throw new ForbiddenError("Only the restaurant can accept this order.");
      }

      const order = await ordersService.restaurantAcceptOrder(id as string, Number(req.body.prepMinutes));
      return res.json(order);
    } catch (error: any) {
      if (error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  /** The food offer this driver is holding, for when the socket event was missed. */
  /** GET /orders/driver/active — the job this driver is on, or { order: null }. */
  async driverActiveOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("User is not authenticated");
      const order: any = await ordersService.getDriverActiveOrder(userId);
      if (!order) return res.json({ order: null });

      const json: any = withoutDriverSecrets(order);
      // A legacy meat centre isn't a Vendor document, so populate leaves `vendor`
      // empty; put its id and name back so the app still treats it as an outlet order.
      const vendorId = order.populated?.("vendor");
      if (!json.vendor && vendorId) {
        const outlet = await outletSummary(vendorId);
        if (outlet) json.vendor = { _id: String(vendorId), ...outlet };
      }
      return res.json({ order: json });
    } catch (error) {
      next(error);
    }
  }

  async currentFoodOffer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("User is not authenticated");
      const offer = await foodDispatch.currentOfferFor(userId);
      return res.json({ offer });
    } catch (error) {
      next(error);
    }
  }

  async decline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const driverUserId = req.user?.userId;

      if (!driverUserId) {
        throw new UnauthorizedError("Driver is not authenticated");
      }
      if (!reason) {
        throw new ValidationError("Decline reason is required");
      }

      await ordersService.declineOrder(id as string, driverUserId, reason);
      return res.json({ success: true, message: "Order declined successfully" });
    } catch (error: any) {
      if (error.message === "Driver profile not found" || error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
      next(error);
    }
  }

  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const orders = await ordersService.getUserOrders(userId);
      return res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getDriverScheduledOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const driver = await Driver.findOne({ user: userId });
      if (!driver) {
        throw new NotFoundError("Driver not found");
      }

      const orders = await Order.find({
        driver: driver._id,
        isReserved: true,
        status: OrderStatus.DRIVER_ASSIGNED,
      }).populate("user").sort({ reservedAt: 1 });

      return res.json(orders.map((o) => withoutDriverSecrets(o)));
    } catch (error: any) {
      next(error);
    }
  }

  async getVendorOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      // Only that vendor, or staff.
      if (!ordersService.canActForVendor(String(vendorId), req.user)) throw new NotFoundError("Vendor not found");

      // 403 rather than 404: vendor ids are public (GET /vendors/nearby lists
      // them), so there is no existence to conceal here — only the order data.
      if (!canAccessVendorData(vendorId as string, req.user)) {
        throw new ForbiddenError("You do not have access to this vendor's orders");
      }

      // Already validated by vendorOrdersQuerySchema. Read straight from req.query:
      // Express 5 re-parses it on every access, so validateRequest's coercion doesn't stick.
      const { since, before, limit } = req.query as Record<string, string | undefined>;
      const orders = await ordersService.getVendorOrders(vendorId as string, {
        since: since ? new Date(since) : undefined,
        before: before ? new Date(before) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      return res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async triggerSOS(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id: orderId } = req.params;

      if (!userId) {
        throw new UnauthorizedError("User is not authenticated");
      }

      const success = await ordersService.triggerOrderSOS(orderId as string, userId);
      return res.json({ success, message: "SOS emergency triggered. Authorities and fleet admins notified." });
    } catch (error) {
      next(error);
    }
  }
}
