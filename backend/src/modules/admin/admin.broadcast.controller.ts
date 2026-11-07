import { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Broadcast, { BROADCAST_AUDIENCES, type BroadcastAudience } from "../../database/models/Broadcast";
import MeatCenter from "../../database/models/MeatCenter";
import User, { UserRole } from "../../database/models/User";
import Vendor from "../../database/models/Vendor";
import { NotificationService } from "../../services/notification.service";

// POST /admin/broadcasts — a controlled push announcement to customers, drivers or partners.
// Admin only, short messages, one send every 30 seconds, and every send is kept in the history
// (and in the audit trail) with who sent it and how many devices it went to.

const MIN_GAP_MS = 30_000;

/** Partner-app screens an announcement may open. Must match the app's allow-list. */
export const PARTNER_SCREENS = ["/(tabs)/orders", "/(tabs)/menu", "/(tabs)/inventory", "/(tabs)/account", "/payouts", "/scheduled-orders", "/support"];

async function tokensFor(audience: BroadcastAudience) {
  const wants = (a: BroadcastAudience) => audience === a || audience === "everyone";
  const find = (role: UserRole) => User.find({ role, expoPushToken: { $exists: true, $nin: [null, ""] }, isBlocked: { $ne: true } }).select("expoPushToken").lean<{ expoPushToken?: string }[]>();
  const [users, drivers, vendors, centers] = await Promise.all([
    wants("users") ? find(UserRole.USER) : [],
    wants("drivers") ? find(UserRole.DRIVER) : [],
    wants("partners") ? Vendor.find({ "expoPushTokens.0": { $exists: true } }).select("expoPushTokens").lean<{ expoPushTokens?: string[] }[]>() : [],
    wants("partners") ? MeatCenter.find({ "expoPushTokens.0": { $exists: true } }).select("expoPushTokens").lean<{ expoPushTokens?: string[] }[]>() : [],
  ]);
  const tokens = [
    ...(users as { expoPushToken?: string }[]).map((u) => u.expoPushToken),
    ...(drivers as { expoPushToken?: string }[]).map((u) => u.expoPushToken),
    ...(vendors as { expoPushTokens?: string[] }[]).flatMap((v) => v.expoPushTokens ?? []),
    ...(centers as { expoPushTokens?: string[] }[]).flatMap((v) => v.expoPushTokens ?? []),
  ];
  return Array.from(new Set(tokens.filter((t): t is string => !!t && t.startsWith("ExponentPushToken"))));
}

export const sendBroadcast = async (req: AuthRequest, res: Response) => {
  try {
    const { audience, title, body, screen } = req.body as { audience: BroadcastAudience; title: string; body: string; screen?: string };

    const last = await Broadcast.findOne().sort({ createdAt: -1 }).select("createdAt").lean<{ createdAt: Date }>();
    if (last && Date.now() - new Date(last.createdAt).getTime() < MIN_GAP_MS) {
      return res.status(429).json({ message: "A broadcast was sent a moment ago. Wait 30 seconds before sending another." });
    }

    const tokens = await tokensFor(audience);
    if (tokens.length === 0) return res.status(409).json({ message: "No devices are registered for that audience yet." });

    const sender = await User.findById(req.user!.userId).select("name").lean<{ name?: string }>();
    const broadcast = await Broadcast.create({
      audience, title, body, screen: screen || undefined,
      sentBy: req.user!.userId, sentByName: sender?.name, recipients: tokens.length,
    });

    // The partner app opens the screen when it is on its allow-list; the other apps just open.
    const data = { kind: "announcement", broadcastId: String(broadcast._id), ...(screen && PARTNER_SCREENS.includes(screen) ? { screen } : {}) };
    // Handed to Expo in the background — a large audience can take a while.
    NotificationService.getInstance()
      .sendPushNotificationsBatch(tokens, title, body, data, "default")
      .catch((error) => console.error("[broadcast] push dispatch failed:", error));

    return res.status(201).json(broadcast);
  } catch (error) {
    console.error("[broadcast] send failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listBroadcasts = async (_req: AuthRequest, res: Response) => {
  try {
    return res.json(await Broadcast.find().sort({ createdAt: -1 }).limit(50).lean());
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const BROADCAST_AUDIENCE_LIST = BROADCAST_AUDIENCES;
