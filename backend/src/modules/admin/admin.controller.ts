import { Request, Response } from "express";
import { resolveHelperRates } from "../pricing/helper.pricing";
import Order, { OrderStatus } from "../../database/models/Order";
import Driver, { DriverStatus, OnboardingStatus } from "../../database/models/Driver";
import { Types } from "mongoose";
import User, { UserRole } from "../../database/models/User";
import SupportTicket from "../../database/models/SupportTicket";
import Coupon from "../../database/models/Coupon";
import SystemConfig from "../../database/models/SystemConfig";
import ChatMessage from "../../database/models/ChatMessage";
import AppVersion from "../../database/models/AppVersion";
import Zone from "../../database/models/Zone";
import Banner from "../../database/models/Banner";
import Offer from "../../database/models/Offer";
import Vendor from "../../database/models/Vendor";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  SUPPORT_CASE_LIMIT,
  assignAndSaveTicket,
  assignUnownedTickets,
  emitTicketUpdate,
  getSupportWorkloads,
} from "../../services/supportAssignment.service";
import { NotificationService } from "../../services/notification.service";
import { sendDriverDecisionEmail } from "../verification/verification.emails";

const SUPPORT_PHONE_PREFIX = "support-";

function findSupportMember(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  // Scoped to SUPPORT so these endpoints can never touch an admin, driver or customer.
  return User.findOne({ _id: id, role: UserRole.SUPPORT });
}

function toSupportMemberResponse(member: { _id: unknown; name: string; email?: string; phone?: string; createdAt?: Date }) {
  return {
    _id: String(member._id),
    name: member.name,
    email: member.email ?? "",
    phone: member.phone && !member.phone.startsWith(SUPPORT_PHONE_PREFIX) ? member.phone : null,
    createdAt: member.createdAt,
  };
}

export class AdminController {
  async getAllOrders(req: Request, res: Response) {
    try {
      // The driver's name and phone live on its User document — populate it so the
      // admin tables show the real driver rather than a generic label.
      const orders = await Order.find()
        .populate("user")
        .populate({ path: "driver", populate: { path: "user", select: "name phone profilePic" } })
        .sort({ createdAt: -1 });
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllDrivers(req: Request, res: Response) {
    try {
      const drivers = await Driver.find().populate("user");
      return res.json(drivers);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const activeDrivers = await Driver.countDocuments({
        status: DriverStatus.ONLINE
      });
      
      const revenueData = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]);
      const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

      // Calculate dynamic daily delivery performance (last 24 hours)
      // Grouping orders by hours: e.g. 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00
      const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
      const barData = await Promise.all(
        hours.map(async (timeStr) => {
          const hourNum = parseInt(timeStr.split(":")[0]);
          const start = new Date();
          start.setHours(hourNum, 0, 0, 0);
          const end = new Date();
          end.setHours(hourNum + 2, 0, 0, 0);

          const delivered = await Order.countDocuments({
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, "delivered"] },
            createdAt: { $gte: start, $lt: end }
          });

          // The real count only: an empty slot is 0, not a random number, and there is no
          // invented "target" alongside it.
          return {
            time: timeStr,
            delivered,
          };
        })
      );

      // Calculate dynamic weekly delivery performance (last 4 weeks)
      const weeklyBarData = await Promise.all(
        [1, 2, 3, 4].map(async (weekNum) => {
          const start = new Date();
          start.setDate(start.getDate() - weekNum * 7);
          const end = new Date();
          end.setDate(end.getDate() - (weekNum - 1) * 7);

          const delivered = await Order.countDocuments({
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, "delivered"] },
            createdAt: { $gte: start, $lt: end }
          });

          return {
            time: `Week ${5 - weekNum}`,
            delivered,
          };
        })
      );

      // Live activity log, built only from records that actually exist. Every
      // entry below is a real row with its real timestamp: there is no padding
      // with invented "System Status: Optimal" filler and no placeholder driver
      // name, so an empty log now honestly renders as an empty log.
      //
      // The driver's name lives on the linked User document (the Driver model has
      // no name of its own), so this needs the nested populate — a plain
      // .populate("driver") left driver.user as an ObjectId and every row fell
      // back to a hardcoded name.
      const dynamicActivity: any[] = [];

      const latestDelivered = await Order.find({ status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, "delivered"] } })
        .populate({ path: "driver", populate: { path: "user" } })
        .sort({ updatedAt: -1 })
        .limit(5);

      latestDelivered.forEach(o => {
        const driverName = (o.driver as any)?.user?.name;
        dynamicActivity.push({
          type: "DELIVERY",
          title: `Order ${o._id} delivered`,
          desc: driverName ? `Driver: ${driverName}` : "Driver unassigned",
          time: o.updatedAt
        });
      });

      const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
      latestUsers.forEach(u => {
        dynamicActivity.push({
          type: "USER_REG",
          title: u.role === UserRole.DRIVER ? "New driver registered" : "New user registered",
          desc: u.name,
          time: u.createdAt
        });
      });

      // Newest first, then trimmed — the two queries above are interleaved by time
      // rather than concatenated, so the panel shows what actually happened last.
      dynamicActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      const activityLog = dynamicActivity.slice(0, 6);

      // Active manifests — the orders that are genuinely in flight right now.
      // Same nested populate as above so the driver's real name comes through,
      // and no invented rows when the board is empty: an idle system should show
      // an empty table, not two fictional San Jose deliveries.
      const liveOrders = await Order.find({
        status: { $in: [OrderStatus.SEARCHING_DRIVER, OrderStatus.DRIVER_ASSIGNED, OrderStatus.IN_TRANSIT, OrderStatus.PICKING_ITEMS, "searching_driver", "driver_assigned"] }
      })
      .populate({ path: "driver", populate: { path: "user" } })
      .sort({ createdAt: -1 })
      .limit(10);

      const manifests = liveOrders.map(o => {
        const destination = o.stops?.[o.stops.length - 1]?.address || null;
        const driverName = (o.driver as any)?.user?.name || null;
        // A real ETA off the order's own routing estimate, instead of the same
        // hardcoded "14:45 PM" that every row used to display.
        const eta = o.duration
          ? new Date(new Date(o.createdAt).getTime() + o.duration * 60000).toISOString()
          : null;
        return {
          // The raw id as well as the display form, so the UI can link the row
          // through to the order without having to reverse the formatting.
          orderId: o._id,
          id: o._id,
          dest: destination,
          driver: driverName,
          eta,
          status: o.status,
          priority: o.stops.length > 2 ? "HIGH" : o.stops.length > 1 ? "EXPRESS" : "STANDARD"
        };
      });

      return res.json({
        totalUsers,
        totalOrders,
        activeDrivers,
        totalRevenue,
        barData,
        weeklyBarData,
        activityLog,
        manifests
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { name, email, phone, role, password, vehicleType } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }

      const user = new User({
        name,
        email,
        phone,
        role: role || "USER",
        password
      });

      await user.save();

      // If user is a DRIVER, automatically create corresponding Driver record
      if (user.role === "DRIVER") {
        const driver = new Driver({
          user: user._id,
          status: DriverStatus.OFFLINE,
          isAvailable: true,
          onboardingStatus: "completed",
          vehicleType: vehicleType || "bike"
        });
        await driver.save();
      }

      return res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, phone, role, isBlocked } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      if (isBlocked !== undefined) user.isBlocked = isBlocked;

      await user.save();
      return res.json({ message: "User updated successfully", user });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // If user was a driver, delete driver record too
      await Driver.findOneAndDelete({ user: id });

      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, isAvailable, vehicleType, gender, isBlocked, onboardingStatus, aadhaarVerified, bankVerified, preferredZone, preferredZones } = req.body;

      const driver = await Driver.findById(id);
      if (!driver) return res.status(404).json({ message: "Driver not found" });

      const previousOnboardingStatus = driver.onboardingStatus;

      if (status !== undefined) driver.status = status;
      if (isAvailable !== undefined) driver.isAvailable = isAvailable;
      if (vehicleType !== undefined) driver.vehicleType = vehicleType;
      if (gender !== undefined) driver.gender = gender;
      if (onboardingStatus !== undefined) driver.onboardingStatus = onboardingStatus;
      if (aadhaarVerified !== undefined) driver.aadhaarVerified = aadhaarVerified;
      if (bankVerified !== undefined) driver.bankVerified = bankVerified;
      if (preferredZone !== undefined) {
        driver.preferredZone = preferredZone ? preferredZone : undefined;
      }
      if (preferredZones !== undefined) {
        driver.preferredZones = (preferredZones || []).slice(0, 2);
      }

      let previousIsBlocked: boolean | undefined;
      if (isBlocked !== undefined && driver.user) {
        const existingUser = await User.findById(driver.user).select("isBlocked");
        previousIsBlocked = existingUser?.isBlocked;
        await User.findByIdAndUpdate(driver.user, { isBlocked });
      }

      await driver.save();

      // Notify the driver of status changes that affect their ability to work (fire-and-forget).
      if (driver.user) {
        const notificationService = NotificationService.getInstance();

        if (onboardingStatus === OnboardingStatus.COMPLETED && previousOnboardingStatus !== OnboardingStatus.COMPLETED) {
          notificationService
            .sendNotification({
              userId: driver.user.toString(),
              title: "You're approved to drive! 🎉",
              body: "Your onboarding has been verified. You can now go online and start accepting jobs.",
              type: "transactional",
              category: "system",
              data: { deepLink: { screen: "/(tabs)" } },
            })
            .catch((err) => console.error("[admin.controller] Failed to send onboarding-approved notification:", err));
          sendDriverDecisionEmail(driver, { kind: "approved" });
        }

        if (onboardingStatus === OnboardingStatus.REJECTED && previousOnboardingStatus !== OnboardingStatus.REJECTED) {
          notificationService
            .sendNotification({
              userId: driver.user.toString(),
              title: "Onboarding not approved",
              body: "We couldn't verify your documents. Please review your submission and try again, or contact support.",
              type: "alert",
              category: "system",
              data: { deepLink: { screen: "/onboarding" } },
            })
            .catch((err) => console.error("[admin.controller] Failed to send onboarding-rejected notification:", err));
          sendDriverDecisionEmail(driver, { kind: "rejected" });
        }

        if (isBlocked !== undefined && previousIsBlocked !== undefined && isBlocked !== previousIsBlocked) {
          notificationService
            .sendNotification({
              userId: driver.user.toString(),
              title: isBlocked ? "Account suspended" : "Account reactivated",
              body: isBlocked
                ? "Your driver account has been suspended. Contact support for details."
                : "Your driver account is active again. You can go online and start accepting jobs.",
              type: "alert",
              category: "system",
              data: { deepLink: { screen: isBlocked ? "/support" : "/(tabs)" } },
            })
            .catch((err) => console.error("[admin.controller] Failed to send block-status notification:", err));
        }
      }

      return res.json({ message: "Driver updated successfully", driver });
    } catch (error) {
      console.error("Error updating driver:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await Driver.findByIdAndDelete(id);
      if (!driver) return res.status(404).json({ message: "Driver not found" });

      return res.json({ message: "Driver deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate("user")
        .populate({ path: "driver", populate: { path: "user", select: "name phone profilePic" } })
        .populate("vendor");
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.json(order);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.json({ message: "Order updated successfully", order });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const orders = await Order.find({
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, "delivered"] }
      }).sort({ createdAt: -1 });

      const payments = orders.map(o => {
        // The order's own payment state: captured online ("paid") or cash the driver
        // confirmed receiving ("cash_collected") is settled; anything else is still pending.
        const settled = o.paymentStatus === "paid" || o.paymentStatus === "cash_collected";
        return {
          id: o._id.startsWith("FLR-") ? o._id.replace("FLR-", "TXN-") : o._id.startsWith("ORD-") ? o._id.replace("ORD-", "TXN-") : `#TXN-${o._id.substring(o._id.length - 6).toUpperCase()}`,
          date: new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          route: o.stops && o.stops.length > 1 ? `${o.stops[0].address || "Pickup"} → ${o.stops[o.stops.length - 1].address || "Dropoff"}` : "Local Delivery",
          fee: `₹${o.totalPrice || 0}`,
          status: settled ? "SETTLED" : "PENDING",
          statusVariant: settled ? "settled" : "pending",
        };
      });

      // No transactions yet means an empty list — never invented demo rows.
      return res.json(payments);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      // The dashboard's range control used to be cosmetic: it relabelled itself and
      // announced an update while the request carried no range at all. It now sends
      // `days`, and everything below is scoped to that window.
      const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
      const rangeStart = new Date();
      rangeStart.setDate(rangeStart.getDate() - days);
      rangeStart.setHours(0, 0, 0, 0);

      // Orders per day across the selected window. A day with no orders reports
      // zero rather than a random figure between 1,500 and 3,000.
      const buckets = Math.min(days, 30);
      const velocityData = await Promise.all(
        Array.from({ length: buckets }, async (_unused, i) => {
          const dayStart = new Date(rangeStart);
          dayStart.setDate(dayStart.getDate() + Math.floor((i * days) / buckets));
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const orders = await Order.countDocuments({
            createdAt: { $gte: dayStart, $lt: dayEnd },
          });

          return {
            day: dayStart.toLocaleDateString([], { day: "numeric", month: "short" }),
            orders,
          };
        })
      );

      // Headline figures for the same window — these were hardcoded in the UI.
      const [rangeOrders, completedInRange, activeDrivers] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: rangeStart } }),
        Order.find({
          createdAt: { $gte: rangeStart },
          status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, "delivered", "completed"] },
        }).select("totalPrice createdAt updatedAt"),
        Driver.countDocuments({ status: DriverStatus.ONLINE }),
      ]);

      const netRevenue = completedInRange.reduce((sum, o: any) => sum + (o.totalPrice || 0), 0);
      const durations = completedInRange
        .map((o: any) => new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime())
        .filter((ms) => ms > 0);
      const avgDeliveryMinutes = durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000)
        : 0;

      const summary = {
        totalOrders: rangeOrders,
        netRevenue: Math.round(netRevenue),
        avgDeliveryMinutes,
        activeDrivers,
        completedOrders: completedInRange.length,
      };

      // Genuine anomalies: orders still sitting in an active state well past the
      // point they should have moved on. The driver's name needs the nested
      // populate — Driver holds only a user reference, so a plain populate left
      // every row reading "Awaiting driver assignment".
      const STUCK_MINUTES = 40;
      const bufferTime = new Date();
      bufferTime.setMinutes(bufferTime.getMinutes() - STUCK_MINUTES);

      const activeOrders = await Order.find({
        status: { $in: [OrderStatus.SEARCHING_DRIVER, OrderStatus.DRIVER_ASSIGNED, OrderStatus.IN_TRANSIT, OrderStatus.PICKING_ITEMS] },
        createdAt: { $lt: bufferTime },
      })
        .populate({ path: "driver", populate: { path: "user" } })
        .sort({ createdAt: 1 })
        .limit(10);

      const anomalies = activeOrders.map((o: any) => {
        const stuckMinutes = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
        // Severity reflects how long it has actually been stuck, rather than
        // labelling every row "Minor Delay".
        const statusVariant = stuckMinutes >= 120 ? "critical" : stuckMinutes >= 75 ? "delay" : "transit";
        const status = stuckMinutes >= 120 ? "Critical Delay" : stuckMinutes >= 75 ? "Major Delay" : "Minor Delay";
        return {
          id: o._id,
          status,
          statusVariant,
          driver: (o.driver as any)?.user?.name || "Unassigned",
          value: `₹${(o.totalPrice || 0).toFixed(2)}`,
          // What is actually known — how long it has been in this state — instead
          // of an invented cause like "Heavy Traffic (Exit 4)".
          activity: `${String(o.status).replace(/_/g, " ").toLowerCase()} for ${stuckMinutes} min`,
          stuckMinutes,
        };
      });

      return res.json({ velocityData, summary, anomalies, rangeDays: days });
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getMultiStop(req: Request, res: Response) {
    try {
      const orders = await Order.find({
        "stops.1": { $exists: true }
      }).populate("driver").populate("user");
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSupportTickets(req: AuthRequest, res: Response) {
    try {
      // Support members only ever see the cases assigned to them; admins see all.
      const filter = req.user?.role === UserRole.SUPPORT ? { assignedTo: req.user.userId } : {};
      const tickets = await SupportTicket.find(filter).populate("assignedTo", "name").sort({ createdAt: -1 });
      return res.json(tickets);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createSupportTicket(req: AuthRequest, res: Response) {
    try {
      const { title, category, message, user } = req.body;
      const ticketId = `QX-${Math.floor(1000 + Math.random() * 9000)}`;
      const ticket = new SupportTicket({
        ticketId,
        title,
        category,
        status: "OPEN",
        message: `"${message}"`,
        user: user || "Platform User",
        time: "Just now",
        messages: [
          { sender: "system", time: "TICKET OPENED • Just now", text: "" },
          { sender: "user", time: "Just now", text: message }
        ]
      });
      // A support member keeps the case they opened; an admin's case is auto-assigned.
      if (req.user?.role === UserRole.SUPPORT) {
        ticket.assignedTo = new Types.ObjectId(req.user.userId);
        ticket.assignedAt = new Date();
        await ticket.save();
      } else {
        await assignAndSaveTicket(ticket);
      }
      emitTicketUpdate(ticket);
      return res.status(201).json(ticket);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateSupportTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, replyText } = req.body;
      const ticket = await SupportTicket.findById(id);
      // Another member's case answers exactly like a missing one.
      const isForeignCase = req.user?.role === UserRole.SUPPORT && ticket?.assignedTo?.toString() !== req.user.userId;
      if (!ticket || isForeignCase) return res.status(404).json({ message: "Ticket not found" });

      if (status !== undefined) {
        if (status === "RESOLVED") {
          ticket.status = "PENDING_RESOLVE";
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          ticket.messages.push({
            sender: "system",
            time: `RESOLUTION REQUESTED • ${nowTime}`,
            text: "Support requested to mark this ticket as resolved. Please confirm."
          });
        } else {
          ticket.status = status;
        }
      }

      if (replyText) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Only staff reach this endpoint, so every reply is a staff reply. The
        // body's `sender` is ignored so support can't post as the customer or system.
        ticket.messages.push({
          sender: "admin",
          time: now,
          text: replyText
        });
      }

      await ticket.save();
      emitTicketUpdate(ticket);

      // Push-notify the customer/driver when staff sends a reply (fire-and-forget).
      if (replyText && ticket.userId) {
        try {
          await NotificationService.getInstance().sendNotification({
            userId: ticket.userId.toString(),
            title: "Support replied 💬",
            body: replyText.length > 120 ? `${replyText.slice(0, 117)}...` : replyText,
            type: "transactional",
            category: "chat",
            data: {
              ticketId: ticket._id,
              deepLink: { screen: "/support-chat", params: { ticketId: ticket._id.toString() } },
            },
          });
        } catch (err) {
          console.error("[admin.controller] Failed to send support reply notification:", err);
        }
      }

      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Support team accounts: SUPPORT-role Users that sign in to the admin panel
  // with an email + password the admin sets here. Passwords are bcrypt-hashed by
  // the User model, so they can be reset but never read back.
  async getSupportMembers(req: Request, res: Response) {
    try {
      const [members, workloads] = await Promise.all([
        User.find({ role: UserRole.SUPPORT }).select("name email phone createdAt updatedAt").sort({ createdAt: -1 }).lean(),
        getSupportWorkloads(),
      ]);
      return res.json(
        members.map((member) => {
          const workload = workloads.find((w) => w.memberId.equals(member._id));
          return {
            ...toSupportMemberResponse(member),
            openCount: workload?.openCount ?? 0,
            pendingCount: workload?.pendingCount ?? 0,
            caseLimit: SUPPORT_CASE_LIMIT,
          };
        }),
      );
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createSupportMember(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email }).select("_id").lean();
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      // Every User needs a unique phone, but support staff sign in by email. The
      // placeholder can never match a real phone login: it contains letters.
      const member = new User({
        name,
        email,
        password,
        phone: `${SUPPORT_PHONE_PREFIX}${new Types.ObjectId().toHexString()}`,
        role: UserRole.SUPPORT,
      });
      await member.save();
      // Cases that arrived while nobody was on the team go to the new member(s) now.
      await assignUnownedTickets();

      return res.status(201).json(toSupportMemberResponse(member.toObject()));
    } catch (error) {
      console.error("Error creating support member:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async resetSupportMemberPassword(req: Request, res: Response) {
    try {
      const member = await findSupportMember(String(req.params.id));
      if (!member) return res.status(404).json({ message: "Support member not found" });

      member.password = req.body.password;
      // Signs the member out everywhere: tokens minted with the old version stop working.
      member.tokenVersion = (member.tokenVersion ?? 0) + 1;
      await member.save();

      return res.json({ message: "Password updated" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteSupportMember(req: Request, res: Response) {
    try {
      const member = await findSupportMember(String(req.params.id));
      if (!member) return res.status(404).json({ message: "Support member not found" });

      // Their open sessions die with the document: authenticateToken 401s a token
      // whose User no longer exists.
      await member.deleteOne();
      // Their unresolved cases go back through the assignment rule.
      await assignUnownedTickets();
      return res.json({ message: "Support member removed" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { origin, stopsCount, driverName } = req.body;
      
      // Find driver by user name or default
      let driverObj = await Driver.findOne().populate("user");
      if (driverName) {
        const u = await User.findOne({ name: new RegExp(driverName, "i") });
        if (u) {
          const d = await Driver.findOne({ user: u._id });
          if (d) driverObj = d;
        }
      }
      
      // Find user (customer)
      let customer = await User.findOne({ role: "USER" });
      if (!customer) {
        customer = await User.findOne();
      }

      // Generate stops dynamically
      const stops = [
        { sequence: 1, type: "pickup", address: origin, location: { type: "Point", coordinates: [81.8040, 17.0005] } }
      ];
      const parsedStopsCount = parseInt(stopsCount) || 3;
      for (let i = 2; i < parsedStopsCount; i++) {
        stops.push({
          sequence: i,
          type: "stop",
          address: `Intermediate Stop ${i-1} near ${origin}`,
          location: { type: "Point", coordinates: [81.8040 + (i-1)*0.01, 17.0005 + (i-1)*0.01] }
        });
      }
      stops.push({
        sequence: parsedStopsCount,
        type: "drop",
        address: `Destination Hub for ${origin}`,
        location: { type: "Point", coordinates: [81.8040 + parsedStopsCount*0.01, 17.0005 + parsedStopsCount*0.01] }
      });

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const random6Digits = Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = `F${day}${month}${year}${random6Digits}`;
      const order = new Order({
        _id: orderId,
        user: customer?._id,
        driver: driverObj?._id,
        status: "DRIVER_ASSIGNED",
        serviceType: "delivery",
        totalDistance: Math.floor(Math.random() * 20 + 5),
        totalPrice: Math.floor(Math.random() * 300 + 100),
        stops
      });

      await order.save();
      return res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSystemConfig(req: Request, res: Response) {
    try {
      let config = await SystemConfig.findOne({ key: "global_settings" });
      if (!config) {
        // Create default system config
        config = new SystemConfig({
          key: "global_settings",
          value: {
            rates: {
              BIKE: { baseFare: 15, perKmRate: 5, perMinRate: 1 },
              AUTO: { baseFare: 25, perKmRate: 8, perMinRate: 2 },
              CAB: { baseFare: 50, perKmRate: 12, perMinRate: 3 },
              CAB_PRIME: { baseFare: 80, perKmRate: 18, perMinRate: 4 },
              DELIVERY: { baseFare: 50, perKmRate: 12, perMinRate: 2 },
              HELPER: { baseFare: 99, perKmRate: 15, perMinRate: 2 }
            },
            platformFee: 5,
            surgeMultiplier: 1
          }
        });
        await config.save();
      }
      // Helper rates always come back complete (defaults for anything never saved).
      return res.json({ ...config.value, helperRates: resolveHelperRates(config.value?.helperRates) });
    } catch (error) {
      console.error("Error getting system config:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateSystemConfig(req: Request, res: Response) {
    try {
      const { rates, platformFee, surgeMultiplier, helperRates } = req.body;
      let config = await SystemConfig.findOne({ key: "global_settings" });
      if (!config) {
        config = new SystemConfig({ key: "global_settings", value: {} });
      }

      // Merged, so saving one section keeps the others (helper rates are saved on their own page).
      config.value = {
        ...config.value,
        rates: rates || config.value.rates,
        platformFee: platformFee !== undefined ? platformFee : config.value.platformFee,
        surgeMultiplier: surgeMultiplier !== undefined ? surgeMultiplier : config.value.surgeMultiplier,
        helperRates: helperRates ? resolveHelperRates({ ...config.value.helperRates, ...helperRates }) : config.value.helperRates,
      };

      config.markModified("value");
      await config.save();
      return res.json({ message: "System configuration updated successfully", config: config.value });
    } catch (error) {
      console.error("Error updating system config:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCoupons(req: Request, res: Response) {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json(coupons);
    } catch (error) {
      console.error("Error getting coupons:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createCoupon(req: Request, res: Response) {
    try {
      const { code, discountType, discountValue, maxDiscount, minOrderValue, expiryDate } = req.body;
      if (!code || !discountType || !discountValue) {
        return res.status(400).json({ message: "Code, discount type, and discount value are required" });
      }

      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      const coupon = new Coupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxDiscount,
        minOrderValue,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        isActive: true
      });

      await coupon.save();
      return res.status(201).json({ message: "Coupon created successfully", coupon });
    } catch (error) {
      console.error("Error creating coupon:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async toggleCouponStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });

      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return res.json({ message: "Coupon status toggled successfully", coupon });
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteCoupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      return res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const orders = await Order.find({ user: id })
        .populate("driver")
        .populate("vendor")
        .sort({ createdAt: -1 });

      const totalOrders = orders.length;
      const deliveryOrders = orders.filter(o => o.serviceType === "delivery").length;
      const ridesOrders = orders.filter(o => o.serviceType !== "delivery" && o.serviceType !== "helper").length;
      const helperOrders = orders.filter(o => o.serviceType === "helper").length;

      // The four counts above only ever said which service a user booked. These
      // add what an admin actually looks a customer up for: what they have spent,
      // how reliably their orders complete, and when they were last active.
      const completedOrders = orders.filter(o =>
        ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(String(o.status))
      );
      const cancelledOrders = orders.filter(o =>
        ["CANCELLED", "cancelled"].includes(String(o.status))
      );
      const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return res.json({
        user,
        stats: {
          totalOrders,
          deliveryOrders,
          ridesOrders,
          helperOrders,
          completedOrders: completedOrders.length,
          cancelledOrders: cancelledOrders.length,
          totalSpent: Math.round(totalSpent),
          averageOrderValue: completedOrders.length > 0 ? Math.round(totalSpent / completedOrders.length) : 0,
          lastOrderAt: orders[0]?.createdAt || null,
        },
        orders
      });
    } catch (error) {
      console.error("Error getting user detail:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getDriverDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const driver = await Driver.findById(id)
        .populate("user")
        .populate("preferredZone")
        .populate("preferredZones");
      if (!driver) return res.status(404).json({ message: "Driver not found" });

      const orders = await Order.find({ driver: id })
        .populate("user")
        .populate("vendor")
        .sort({ createdAt: -1 });

      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED" || o.status === "delivered").length;
      const cancelledOrders = orders.filter(o => o.status === "CANCELLED").length;

      return res.json({
        driver,
        stats: {
          totalOrders,
          completedOrders,
          cancelledOrders
        },
        orders
      });
    } catch (error) {
      console.error("Error getting driver detail:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrderChat(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const messages = await ChatMessage.find({ orderId })
        .populate("senderId", "name phone email")
        .sort({ createdAt: 1 });
      return res.json(messages);
    } catch (error) {
      console.error("Error getting order chat:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAppVersions(req: Request, res: Response) {
    try {
      const configs = await AppVersion.find({});
      return res.json(configs);
    } catch (error) {
      console.error("Error getting app versions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateAppVersion(req: Request, res: Response) {
    try {
      const { platform, latest, minRequired, storeUrl } = req.body;

      if (!platform || !latest || !minRequired || !storeUrl) {
        return res.status(400).json({ message: "platform, latest, minRequired, and storeUrl are required" });
      }

      const config = await AppVersion.findOneAndUpdate(
        { platform },
        { latest, minRequired, storeUrl },
        { new: true, upsert: true }
      );

      return res.json({ success: true, data: config });
    } catch (error) {
      console.error("Error updating app version:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async seedDevDrivers(req: Request, res: Response) {
    try {
      // 1. Clean existing check users/drivers (robust check by name, email, or phone)
      const checkEmails = [];
      const checkPhones = [];
      for (let i = 1; i <= 10; i++) {
        checkEmails.push(`check${i}@example.com`);
        checkPhones.push(`+999999000${i}`);
      }

      const devUsers = await User.find({
        $or: [
          { name: /^check/i },
          { email: { $in: checkEmails } },
          { phone: { $in: checkPhones } }
        ]
      });
      const devUserIds = devUsers.map((u) => u._id);
      await Driver.deleteMany({ user: { $in: devUserIds } });
      await User.deleteMany({ _id: { $in: devUserIds } });

      // 2. Seed 10 check drivers
      const seededDrivers = [];
      const centers = [
        { lat: 16.9891, lng: 82.2475, name: "Kakinada" },
        { lat: 17.0005, lng: 81.7831, name: "Rajahmundry" },
        { lat: 16.7300, lng: 82.2100, name: "Yanam" }
      ];

      for (let i = 1; i <= 10; i++) {
        const user = new User({
          name: `check${i}`,
          email: `check${i}@example.com`,
          phone: `+999999000${i}`,
          password: "password123",
          role: "DRIVER"
        });
        await user.save();

        const center = centers[(i - 1) % centers.length];
        const angle = (i * 2 * Math.PI) / 10;
        const radius = 0.012; // spread of ~1.2km around the center
        let lat = center.lat + Math.sin(angle) * radius;
        let lng = center.lng + Math.cos(angle) * radius;
        let preferredZone = undefined;

        try {
          const { ZonesService } = require("../zones/zones.service");
          const zonesService = new ZonesService();
          const activeZone = await zonesService.getZoneForCoordinates(lat, lng);
          if (activeZone) {
            preferredZone = activeZone._id;
          }
        } catch (zoneErr) {
          console.warn("Dev driver seed zone lookup error:", zoneErr);
        }

        const driver = new Driver({
          user: user._id,
          status: DriverStatus.ONLINE,
          isAvailable: true,
          onboardingStatus: "completed",
          vehicleType: "bike",
          preferredZone,
          currentLocation: {
            type: "Point",
            coordinates: [lng, lat]
          }
        });
        await driver.save();
        
        // Sync with Redis if active
        try {
          const { SocketManager } = require("../../sockets/socket.manager");
          const socketManager = SocketManager.getInstance();
          const redisClient = socketManager ? socketManager.redisClient : null;
          if (redisClient && redisClient.isReady) {
            await redisClient.geoAdd("drivers:locations", {
              longitude: lng,
              latitude: lat,
              member: driver._id.toString()
            });
            await redisClient.set(`driver_status:${driver._id}`, "online", { EX: 30 });
          }
        } catch (redisErr) {
          console.warn("Dev driver Redis sync warning:", redisErr);
        }

        seededDrivers.push(driver);
      }

      return res.json({ success: true, message: "10 Dev Drivers seeded successfully", count: seededDrivers.length });
    } catch (error) {
      console.error("Error seeding dev drivers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getDevDrivers(req: Request, res: Response) {
    try {
      const devUsers = await User.find({ name: /^check/i });
      const devUserIds = devUsers.map((u) => u._id);
      const drivers = await Driver.find({ user: { $in: devUserIds } }).populate("user");
      return res.json(drivers);
    } catch (error) {
      console.error("Error getting dev drivers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateDevDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, vehicleType, latitude, longitude } = req.body;

      const driver = await Driver.findById(id).populate("user");
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      if (status !== undefined) {
        driver.status = status;
        driver.isAvailable = status === "ONLINE";
      }
      if (vehicleType !== undefined) {
        driver.vehicleType = vehicleType;
      }
      if (latitude !== undefined && longitude !== undefined) {
        driver.currentLocation = {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)]
        };
        try {
          const { ZonesService } = require("../zones/zones.service");
          const zonesService = new ZonesService();
          const activeZone = await zonesService.getZoneForCoordinates(Number(latitude), Number(longitude));
          if (activeZone) {
            driver.preferredZone = activeZone._id;
          }
        } catch (zoneErr) {
          console.warn("Dev driver update zone lookup error:", zoneErr);
        }
      }

      await driver.save();

      // Sync with Redis if active
      try {
        const { SocketManager } = require("../../sockets/socket.manager");
        const socketManager = SocketManager.getInstance();
        const redisClient = socketManager ? socketManager.redisClient : null;
        if (redisClient && redisClient.isReady) {
          if (status === "ONLINE" && driver.currentLocation) {
            await redisClient.geoAdd("drivers:locations", {
              longitude: Number(longitude),
              latitude: Number(latitude),
              member: driver._id.toString()
            });
          }
          await redisClient.set(`driver_status:${driver._id}`, status === "ONLINE" ? "online" : "offline", { EX: 30 });
        }
      } catch (redisErr) {
        console.warn("Dev driver Redis update warning:", redisErr);
      }

      return res.json({ success: true, driver });
    } catch (error) {
      console.error("Error updating dev driver:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteDevDrivers(req: Request, res: Response) {
    try {
      const devUsers = await User.find({ name: /^check/i });
      const devUserIds = devUsers.map((u) => u._id);
      const devDrivers = await Driver.find({ user: { $in: devUserIds } });
      const devDriverIds = devDrivers.map((d) => d._id);

      try {
        const { SocketManager } = require("../../sockets/socket.manager");
        const socketManager = SocketManager.getInstance();
        const redisClient = socketManager ? socketManager.redisClient : null;
        if (redisClient && redisClient.isReady) {
          for (const driverId of devDriverIds) {
            await redisClient.geoRemove("drivers:locations", driverId.toString());
            await redisClient.del(`driver_status:${driverId}`);
          }
        }
      } catch (redisErr) {
        console.warn("Dev driver delete Redis warning:", redisErr);
      }

      await Driver.deleteMany({ _id: { $in: devDriverIds } });
      await User.deleteMany({ _id: { $in: devUserIds } });

      return res.json({ message: "All mock dev drivers deleted successfully!" });
    } catch (error) {
      console.error("Error deleting dev drivers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getBanners(req: Request, res: Response) {
    try {
      const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.json(banners);
    } catch (error) {
      console.error("Error getting banners:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createBanner(req: Request, res: Response) {
    try {
      const { title, description, imageUrl, targetUrl, itemType, position, isActive, displayOrder, color1, color2 } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ message: "Title and Image URL are required" });
      }

      const banner = new Banner({
        title,
        description,
        imageUrl,
        targetUrl,
        itemType: itemType || 'banner',
        position: position || 'hero',
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        color1,
        color2
      });

      await banner.save();
      return res.status(201).json({ message: "Banner created successfully", banner });
    } catch (error) {
      console.error("Error creating banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, imageUrl, targetUrl, itemType, position, isActive, displayOrder, color1, color2 } = req.body;
      const banner = await Banner.findById(id);
      
      if (!banner) return res.status(404).json({ message: "Banner not found" });

      if (title !== undefined) banner.title = title;
      if (description !== undefined) banner.description = description;
      if (imageUrl !== undefined) banner.imageUrl = imageUrl;
      if (targetUrl !== undefined) banner.targetUrl = targetUrl;
      if (itemType !== undefined) banner.itemType = itemType;
      if (position !== undefined) banner.position = position;
      if (isActive !== undefined) banner.isActive = isActive;
      if (displayOrder !== undefined) banner.displayOrder = displayOrder;
      if (color1 !== undefined) banner.color1 = color1;
      if (color2 !== undefined) banner.color2 = color2;

      await banner.save();
      return res.json({ message: "Banner updated successfully", banner });
    } catch (error) {
      console.error("Error updating banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const banner = await Banner.findByIdAndDelete(id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });
      return res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error("Error deleting banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOffers(req: Request, res: Response) {
    try {
      const offers = await Offer.find()
        .sort({ displayOrder: 1, createdAt: -1 })
        .populate("vendor", "_id name image");
      return res.json(offers);
    } catch (error) {
      console.error("Error getting offers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createOffer(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!(await Vendor.exists({ _id: body.vendor }))) {
        return res.status(400).json({ message: "Restaurant not found" });
      }

      const offer = new Offer(stripEmptyOfferFields(body));
      await offer.save();
      await offer.populate("vendor", "_id name image");
      return res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateOffer(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Offer not found" });

      const body = req.body;
      if (body.vendor !== undefined && !(await Vendor.exists({ _id: body.vendor }))) {
        return res.status(400).json({ message: "Restaurant not found" });
      }

      const existing = await Offer.findById(id).lean();
      if (!existing) return res.status(404).json({ message: "Offer not found" });

      const $set: Record<string, unknown> = {};
      const $unset: Record<string, ""> = {};
      for (const field of OFFER_FIELDS) {
        const value = body[field];
        if (value === undefined) continue;
        if (value === null || value === "") $unset[field] = "";
        else $set[field] = value;
      }

      // A partial update still has to leave a valid offer behind.
      const start = "startDate" in $unset ? null : (($set.startDate as Date | undefined) ?? existing.startDate);
      const end = "endDate" in $unset ? null : (($set.endDate as Date | undefined) ?? existing.endDate);
      if (start && end && new Date(end) < new Date(start)) {
        return res.status(400).json({ message: "End date must be after the start date" });
      }
      const discountType = ($set.discountType as string | undefined) ?? existing.discountType;
      const discountValue = ($set.discountValue as number | undefined) ?? existing.discountValue;
      if (discountType === "PERCENTAGE" && discountValue > 100) {
        return res.status(400).json({ message: "A percentage discount cannot exceed 100" });
      }
      for (const required of ["title", "vendor", "discountType", "discountValue"]) {
        if (required in $unset) return res.status(400).json({ message: `${required} cannot be cleared` });
      }

      const update: Record<string, unknown> = {};
      if (Object.keys($set).length) update.$set = $set;
      if (Object.keys($unset).length) update.$unset = $unset;
      const offer = await Offer.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate(
        "vendor",
        "_id name image"
      );
      return res.json(offer);
    } catch (error) {
      console.error("Error updating offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteOffer(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      if (!Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Offer not found" });
      const offer = await Offer.findByIdAndDelete(id);
      if (!offer) return res.status(404).json({ message: "Offer not found" });
      return res.json({ message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Error deleting offer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const OFFER_FIELDS = [
  "title",
  "description",
  "vendor",
  "discountType",
  "discountValue",
  "maxDiscount",
  "minOrderValue",
  "couponCode",
  "imageUrl",
  "startDate",
  "endDate",
  "isActive",
  "displayOrder",
] as const;

/** Leaves cleared ("" / null) optional fields out, so they are simply absent on a new offer. */
function stripEmptyOfferFields(body: Record<string, unknown>) {
  const doc: Record<string, unknown> = {};
  for (const field of OFFER_FIELDS) {
    const value = body[field];
    if (value !== undefined && value !== null && value !== "") doc[field] = value;
  }
  return doc;
}
