import SupportTicket from "../database/models/SupportTicket";
import User from "../database/models/User";
import Vendor from "../database/models/Vendor";
import MeatCenter from "../database/models/MeatCenter";
import { assignAndSaveTicket, emitTicketCreated } from "./supportAssignment.service";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];

// Vendor and meat-centre tokens carry a Vendor/MeatCenter _id, not a User _id
// (see utils/generateToken.ts), so the partner app's tickets are filed under
// the outlet. A meat vendor may be either a Vendor (partnerType "meat") or a
// legacy MeatCenter, the same split /vendors/login and /meat/login cover.
export async function resolveTicketOwner(userId: string, role?: string): Promise<{ id: unknown; name: string; role: string } | null> {
  if (role && VENDOR_ROLES.includes(role)) {
    const outlet = (await Vendor.findById(userId).select("name").lean()) || (await MeatCenter.findById(userId).select("name").lean());
    return outlet ? { id: outlet._id, name: outlet.name || "Partner", role: "VENDOR" } : null;
  }
  const user = await User.findById(userId);
  return user ? { id: user._id, name: user.name, role: user.role } : null;
}

export interface CreateSupportTicketInput {
  owner: { id: unknown; name: string; role: string };
  title: string;
  category: string;
  message: string;
  /** Extra system lines shown to the agent under the opening message (e.g. what the bot said). */
  systemNotes?: string[];
  orderId?: string | null;
  botQuery?: unknown;
}

/** Creates, assigns and announces a support ticket. Shared by the ticket API and the support bot. */
export async function createSupportTicket(input: CreateSupportTicketInput) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const messages: any[] = [{ sender: "system", time: `TICKET OPENED • ${now}`, text: "" }];
  for (const note of input.systemNotes || []) messages.push({ sender: "system", time: now, text: note });
  messages.push({ sender: "user", time: now, text: input.message });

  // QX-#### has only 9000 values, so two tickets can collide: retry on the unique index.
  for (let attempt = 0; ; attempt++) {
    const ticket = new SupportTicket({
      ticketId: `QX-${Math.floor(1000 + Math.random() * 9000)}`,
      title: input.title,
      category: input.category,
      status: "OPEN",
      message: `"${input.message}"`,
      user: input.owner.name,
      userRole: input.owner.role,
      userId: input.owner.id,
      time: "Just now",
      messages,
      orderId: input.orderId || null,
      botQuery: input.botQuery || null,
    });
    try {
      await assignAndSaveTicket(ticket);
    } catch (err: any) {
      if (err?.code === 11000 && attempt < 5) continue;
      throw err;
    }
    emitTicketCreated(ticket);
    return ticket;
  }
}
