import { Request, Response, NextFunction } from "express";
import { OrdersService } from "./orders.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import Order, { OrderStatus, ServiceType } from "../../database/models/Order";
import Driver from "../../database/models/Driver";
import { CouponsService } from "../coupons/coupons.service";
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } from "../../utils/errors";
import { InvoiceService } from "../../services/invoice.service";

const ordersService = new OrdersService();
const couponsService = new CouponsService();

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
      // Only the order's customer, assigned driver, vendor, or staff (otherwise "not found").
      const { order } = await ordersService.getOrderForActor(id as string, req.user);

      // Same flattened `items` the list endpoint returns, so reorder works from the detail
      // screen too without the client having to dig through stops[].items.lines.
      return res.json({ ...order.toJSON(), items: ordersService.extractOrderItems(order) });
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
      // Staff may answer on a vendor's behalf with the vendorId they send.
      const role = String(req.user?.role || "");
      const isStaff = role === "ADMIN" || role === "SUPPORT";
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
      const { relation } = await ordersService.getOrderForActor(id as string, req.user);
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
        if (orderObj && orderObj.deliveryOtp) {
          if (otp !== orderObj.deliveryOtp) {
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
          // Only the order's own code — no master code (RAZORPAY_INTEGRATION.md §5.4 A2/C1).
          if (otp !== (orderObj as any).restaurantPickupCode) {
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

  async cashCollected(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new UnauthorizedError("User is not authenticated");
      const order = await ordersService.confirmCashCollected(String(req.params.id), userId, Number(req.body.amount));
      return res.json(order);
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
      // Only that vendor, or staff.
      if (!ordersService.canActForVendor(String(vendorId), req.user)) throw new NotFoundError("Vendor not found");
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
