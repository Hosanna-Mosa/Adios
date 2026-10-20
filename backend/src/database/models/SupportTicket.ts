import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

export interface IInternalNote {
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  title: string;
  category: string;
  status: "OPEN" | "RESOLVED" | "PENDING_RESOLVE";
  message: string;
  user: string;
  userRole?: string;
  userId?: mongoose.Types.ObjectId | string;
  time: string;
  messages: IChatMessage[];
  // The SUPPORT member who owns this case (see services/supportAssignment.service.ts).
  // Unset while there are no support members; admins see every case regardless.
  assignedTo?: mongoose.Types.ObjectId | null;
  assignedAt?: Date | null;
  // Set when the customer escalated from the support bot: the order they asked about and the
  // bot query (question + the answer they were not satisfied with) for the agent's context.
  orderId?: string | null;
  botQuery?: mongoose.Types.ObjectId | null;
  /** How soon staff must act — drives the SLA timers (see modules/support/support.sla.ts). */
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  /** When staff first answered the customer; the first-response timer stops here. */
  firstResponseAt?: Date | null;
  /** When the case was last resolved; cleared if it is reopened. */
  resolvedAt?: Date | null;
  /** Private to staff. Never loaded unless asked for ("+internalNotes"), so it cannot reach a customer. */
  internalNotes?: IInternalNote[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "RESOLVED", "PENDING_RESOLVE"], default: "OPEN" },
    message: { type: String, required: true },
    user: { type: String, required: true },
    userRole: { type: String, enum: ["USER", "DRIVER", "VENDOR", "ADMIN"], default: "USER" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    time: { type: String, required: true },
    messages: [
      {
        sender: { type: String, enum: ["user", "admin", "system"], required: true },
        time: { type: String, required: true },
        text: { type: String, default: "" }
      }
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    assignedAt: { type: Date, default: null },
    orderId: { type: String, default: null },
    botQuery: { type: Schema.Types.ObjectId, ref: "SupportBotQuery", default: null },
    priority: { type: String, enum: ["LOW", "NORMAL", "HIGH", "URGENT"], default: "NORMAL" },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    internalNotes: {
      type: [
        {
          authorId: { type: String, required: true },
          authorName: { type: String, required: true },
          text: { type: String, required: true, maxlength: 2000 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Priority and the SLA clocks are for staff. A customer or driver reading their own ticket
      // (or receiving its live update) never gets them; the staff endpoints ask with { staff: true }.
      transform(_doc: any, ret: any, options: any) {
        if (!options?.staff) {
          delete ret.priority;
          delete ret.firstResponseAt;
          delete ret.resolvedAt;
        }
        return ret;
      },
    },
  }
);

SupportTicketSchema.index({ assignedTo: 1, status: 1 });

// The SLA clocks follow the conversation wherever it is saved from (admin panel, customer reply,
// bot escalation): the first staff message stops the first-response timer, and resolving stops
// the resolution timer until the case is reopened.
SupportTicketSchema.pre("save", function (this: ISupportTicket) {
  if (!this.firstResponseAt && this.isModified("messages") && this.messages?.some((m) => m.sender === "admin")) {
    this.firstResponseAt = new Date();
  }
  if (this.isModified("status")) {
    if (this.status === "RESOLVED") this.resolvedAt = this.resolvedAt ?? new Date();
    else this.resolvedAt = null;
  }
});

export default mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
