import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import SupportTicket from "../../database/models/SupportTicket";
import User from "../../database/models/User";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import { assignAndSaveTicket, emitTicketUpdate } from "../../services/supportAssignment.service";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];

// Vendor and meat-centre tokens carry a Vendor/MeatCenter _id, not a User _id
// (see utils/generateToken.ts), so the partner app's tickets are filed under
// the outlet. A meat vendor may be either a Vendor (partnerType "meat") or a
// legacy MeatCenter, the same split /vendors/login and /meat/login cover.
async function resolveTicketOwner(userId: string, role?: string): Promise<{ id: unknown; name: string; role: string } | null> {
  if (role && VENDOR_ROLES.includes(role)) {
    const outlet = (await Vendor.findById(userId).select("name").lean()) || (await MeatCenter.findById(userId).select("name").lean());
    return outlet ? { id: outlet._id, name: outlet.name || "Partner", role: "VENDOR" } : null;
  }
  const user = await User.findById(userId);
  return user ? { id: user._id, name: user.name, role: user.role } : null;
}

export class SupportController {
  async getTickets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
      return res.json(tickets);
    } catch (error) {
      console.error("Get support tickets error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createTicket(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const owner = await resolveTicketOwner(userId, req.user?.role);
      if (!owner) return res.status(404).json({ message: "User not found" });

      const { title, category, message } = req.body;
      if (!title || !category || !message) {
        return res.status(400).json({ message: "Title, category and message are required" });
      }

      const ticketId = `QX-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const ticket = new SupportTicket({
        ticketId,
        title,
        category,
        status: "OPEN",
        message: `"${message}"`,
        user: owner.name,
        userRole: owner.role,
        userId: owner.id,
        time: "Just now",
        messages: [
          { sender: "system", time: `TICKET OPENED • ${now}`, text: "" },
          { sender: "user", time: now, text: message }
        ]
      });

      await assignAndSaveTicket(ticket);
      emitTicketUpdate(ticket);

      return res.status(201).json(ticket);
    } catch (error) {
      console.error("Create support ticket error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async sendReply(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Message text is required" });
      }

      const ticket = await SupportTicket.findById(id);
      if (!ticket) return res.status(404).json({ message: "Support ticket not found" });

      // Security validation: check ownership
      if (ticket.userId && ticket.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      ticket.messages.push({
        sender: "user",
        time: now,
        text: text.trim()
      });

      // Re-open if resolved
      ticket.status = "OPEN";
      ticket.time = "Just now";

      await ticket.save();

      emitTicketUpdate(ticket);

      return res.json(ticket);
    } catch (error) {
      console.error("Send support reply error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async resolveTicket(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const { approve } = req.body;

      const ticket = await SupportTicket.findById(id);
      if (!ticket) return res.status(404).json({ message: "Support ticket not found" });

      if (ticket.userId && ticket.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (approve) {
        ticket.status = "RESOLVED";
        ticket.messages.push({
          sender: "system",
          time: `TICKET RESOLVED • ${now}`,
          text: "Case marked as resolved by customer."
        });
      } else {
        ticket.status = "OPEN";
        ticket.messages.push({
          sender: "system",
          time: `RE-OPENED • ${now}`,
          text: "Customer declined resolution request. Ticket remains open."
        });
      }

      await ticket.save();

      emitTicketUpdate(ticket);

      return res.json(ticket);
    } catch (error) {
      console.error("Resolve ticket error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
