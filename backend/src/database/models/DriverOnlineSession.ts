import mongoose, { Document, Schema } from "mongoose";
import { SESSION_STALE_MS } from "../../modules/drivers/onlineTime";

/**
 * One stretch of a driver being online, from going online to going offline. The earnings screen's
 * "Online hours" adds these up (modules/drivers/onlineTime.ts).
 *
 * Open stretch = no `endedAt` field. `lastSeenAt` is the last time the driver was heard from (a location
 * ping), so a stretch that never got closed still ends at a sensible time.
 */
export interface IDriverOnlineSession extends Document {
  driver: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  lastSeenAt: Date;
}

const DriverOnlineSessionSchema = new Schema<IDriverOnlineSession>({
  driver: { type: Schema.Types.ObjectId, ref: "Driver", required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  lastSeenAt: { type: Date, required: true },
});

DriverOnlineSessionSchema.index({ driver: 1, startedAt: -1 });
// A driver has at most one open stretch, even if two pings arrive at once.
DriverOnlineSessionSchema.index(
  { driver: 1 },
  { unique: true, partialFilterExpression: { endedAt: { $exists: false } }, name: "one_open_session_per_driver" },
);

const DriverOnlineSession = mongoose.model<IDriverOnlineSession>("DriverOnlineSession", DriverOnlineSessionSchema);
export default DriverOnlineSession;

// Pings arrive every few seconds; writing each one would be a lot of traffic for a number that only
// needs to be right to the minute.
const TOUCH_EVERY_MS = 60_000;
const lastTouched = new Map<string, number>();

const isDuplicateKey = (error: any) => error?.code === 11000;

/**
 * The driver is online now. Starts a stretch, or keeps the open one if it is recent; an old open one
 * (the driver vanished without going offline) is closed where it was last heard from and a new one starts.
 */
export async function markDriverOnline(driverId: mongoose.Types.ObjectId | string, now: Date = new Date()) {
  const id = String(driverId);
  try {
    const open = await DriverOnlineSession.findOne({ driver: id, endedAt: { $exists: false } });
    if (open && now.getTime() - open.lastSeenAt.getTime() <= SESSION_STALE_MS) {
      open.lastSeenAt = now;
      await open.save();
    } else {
      if (open) {
        open.endedAt = new Date(Math.min(now.getTime(), open.lastSeenAt.getTime() + SESSION_STALE_MS));
        await open.save();
      }
      await DriverOnlineSession.create({ driver: id, startedAt: now, lastSeenAt: now });
    }
    lastTouched.set(id, now.getTime());
  } catch (error) {
    // Another ping created the stretch first: fine.
    if (!isDuplicateKey(error)) throw error;
  }
}

/** A ping from a driver who is online: keeps their stretch alive (at most once a minute). */
export async function touchDriverOnline(driverId: mongoose.Types.ObjectId | string, now: Date = new Date()) {
  const id = String(driverId);
  if (now.getTime() - (lastTouched.get(id) ?? 0) < TOUCH_EVERY_MS) return;
  await markDriverOnline(id, now);
}

/** The driver went offline: close their open stretch. */
export async function markDriverOffline(driverId: mongoose.Types.ObjectId | string, now: Date = new Date()) {
  const id = String(driverId);
  lastTouched.delete(id);
  const open = await DriverOnlineSession.findOne({ driver: id, endedAt: { $exists: false } });
  if (!open) return;
  // Silent for ages before this? They were gone earlier: end it there, not now.
  open.endedAt = new Date(Math.min(now.getTime(), open.lastSeenAt.getTime() + SESSION_STALE_MS));
  await open.save();
}

/** The stretches that touch [from, to), for adding up. */
export async function onlineSessionsWithin(driverId: mongoose.Types.ObjectId | string, from: Date, to: Date) {
  return DriverOnlineSession.find({
    driver: String(driverId),
    startedAt: { $lt: to },
    $or: [{ endedAt: { $exists: false } }, { endedAt: { $gt: from } }],
  }).lean();
}
