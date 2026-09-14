import { Request, Response, NextFunction } from "express";
import { OrdersService } from "./orders.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import Order, { OrderStatus, ServiceType } from "../../database/models/Order";
import { UserRole } from "../../database/models/User";
import Driver from "../../database/models/Driver";
import { CouponsService } from "../coupons/coupons.service";
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from "../../utils/errors";
import { InvoiceService } from "../../services/invoice.service";
import { getDriverRating } from "../reviews/driver-rating";

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
      const { stops, serviceType, vendorId, totals, radius, duration, isReserved, reservedAt, customerPrice, bookingFor, scheduledDelivery, scheduledFor, couponCode } = req.body;
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
      });

      return res.status(201).json(order);
    } catch (error: any) {
      next(error);
    }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await ordersService.getOrderById(id as string);

      if (!order) {
        throw new NotFoundError("Order not found");
      }

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
      const order = await ordersService.getOrderById(id as string);

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      // The invoice renders the customer's name, phone and both addresses, so it
      // is gated to the same parties as the order itself.
      if (!canReadOrder(order, req.user)) {
        throw new NotFoundError("Order not found");
      }

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

  async respondScheduledDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { vendorId, accepted, reason } = req.body;
      
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

      // If updating to DELIVERED status, verify the customer delivery OTP
      const isDeliveredStatus = 
        status === OrderStatus.DELIVERED || 
        status === OrderStatus.DELIVERED_LC || 
        status.toLowerCase() === "delivered" || 
        status.toLowerCase() === "completed";

      if (isDeliveredStatus) {
        const orderObj = await ordersService.getOrderById(id as string);
        if (orderObj && orderObj.deliveryOtp) {
          if (!verificationCodeMatches(otp, orderObj.deliveryOtp)) {
            throw new ValidationError("Invalid delivery verification OTP. Please ask the customer for the correct code.");
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
        if (orderObj && (orderObj as any).restaurantPickupCode) {
          if (!verificationCodeMatches(otp, (orderObj as any).restaurantPickupCode)) {
            throw new ValidationError("Invalid restaurant pickup code. Please ask the restaurant for the correct code.");
          }
        }
      }

      const order = await ordersService.updateOrderStatus(id as string, status);
      return res.json(order);
    } catch (error: any) {
      if (error.message === "Order not found") {
        return next(new NotFoundError(error.message));
      }
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
      return res.json(order);
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

      return res.json(orders);
    } catch (error: any) {
      next(error);
    }
  }

  async getVendorOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;

      // 403 rather than 404: vendor ids are public (GET /vendors/nearby lists
      // them), so there is no existence to conceal here — only the order data.
      if (!canAccessVendorData(vendorId as string, req.user)) {
        throw new ForbiddenError("You do not have access to this vendor's orders");
      }

      const orders = await ordersService.getVendorOrders(vendorId as string);
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
