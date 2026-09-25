import mongoose from "mongoose";
import AnalyticsEvent, { ANALYTICS_APPS, AnalyticsApp } from "../../database/models/AnalyticsEvent";
import { UserRole } from "../../database/models/User";

// Names the apps may send. Must stay in step with the trackEvent calls in
// app/ and driver/ — anything not listed is dropped rather than stored, so a
// typo or a stale build cannot quietly create a metric nobody looks at.
export const ALLOWED_EVENTS = new Set([
  "screen_view",
  "login",
  "sign_up",
  // customer app
  "order_placed",
  "purchase",
  "order_cancelled",
  // driver app
  "go_online",
  "go_offline",
  "order_accepted",
  "order_declined",
  "order_status_updated",
  "order_completed",
  "onboarding_completed",
  "onboarding_skipped",
]);

const PLATFORMS = ["android", "ios", "web"] as const;
const MAX_PROP_KEYS = 20;
const MAX_PROP_STRING = 200;
const MAX_PROPS_BYTES = 2048;
// Events queued on a phone that was offline arrive late; anything claiming to
// be further off than this is a wrong device clock, so server time is used.
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;
const TIMEZONE = "Asia/Kolkata";

export interface IngestCaller {
  userId?: string;
  role?: string;
}

/** Keeps only flat string/number/boolean values, size-capped. */
function sanitizeProps(raw: unknown): Record<string, string | number | boolean> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(raw).slice(0, MAX_PROP_KEYS)) {
    if (key.length > 40 || key.startsWith("$") || key.includes(".")) continue;
    if (typeof value === "string") out[key] = value.slice(0, MAX_PROP_STRING);
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
  }
  if (Object.keys(out).length === 0) return undefined;
  return Buffer.byteLength(JSON.stringify(out)) > MAX_PROPS_BYTES ? { truncated: true } : out;
}

/** Signed-in users are counted once across sessions; anonymous ones by session. */
const visitorKey = { $ifNull: [{ $toString: "$user" }, "$sessionId"] };

export class AnalyticsService {
  /** Validates each event on its own and stores the good ones. Returns how many were kept. */
  async ingest(events: unknown[], caller: IngestCaller): Promise<number> {
    const now = Date.now();
    // Vendor tokens carry a Vendor id, not a User id — only attribute real users.
    const isUser = caller.role && (Object.values(UserRole) as string[]).includes(caller.role);
    const user = isUser && caller.userId && mongoose.Types.ObjectId.isValid(caller.userId)
      ? new mongoose.Types.ObjectId(caller.userId)
      : undefined;

    const docs = [];
    for (const raw of events) {
      if (!raw || typeof raw !== "object") continue;
      const e = raw as Record<string, unknown>;

      if (typeof e.name !== "string" || !ALLOWED_EVENTS.has(e.name)) continue;
      if (typeof e.app !== "string" || !(ANALYTICS_APPS as readonly string[]).includes(e.app)) continue;
      if (typeof e.sessionId !== "string" || e.sessionId.length === 0 || e.sessionId.length > 64) continue;

      const at = typeof e.at === "number" && Math.abs(now - e.at) <= MAX_CLOCK_SKEW_MS ? e.at : now;

      docs.push({
        name: e.name,
        app: e.app as AnalyticsApp,
        user,
        role: user ? caller.role : undefined,
        sessionId: e.sessionId,
        platform: (PLATFORMS as readonly unknown[]).includes(e.platform) ? e.platform : "unknown",
        appVersion: typeof e.appVersion === "string" ? e.appVersion.slice(0, 24) : undefined,
        props: sanitizeProps(e.props),
        at: new Date(at),
      });
    }

    if (docs.length > 0) {
      await AnalyticsEvent.insertMany(docs, { ordered: false });
    }
    return docs.length;
  }

  /** Everything the admin Live Activity page shows for the last `minutes`. */
  async getLiveActivity(minutes = 30) {
    const now = new Date();
    const since = new Date(now.getTime() - minutes * 60 * 1000);
    const activeNowSince = new Date(now.getTime() - 5 * 60 * 1000);
    const match = { at: { $gte: since } };

    const [perApp, activeNow, perMinute, topEvents, topScreens, recent] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$app",
            events: { $sum: 1 },
            visitors: { $addToSet: visitorKey },
            signedIn: { $addToSet: "$user" },
          },
        },
        { $project: { events: 1, activeUsers: { $size: "$visitors" }, signedInUsers: { $size: "$signedIn" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { at: { $gte: activeNowSince } } },
        { $group: { _id: "$app", visitors: { $addToSet: visitorKey } } },
        { $project: { activeNow: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: { app: "$app", minute: { $dateToString: { format: "%Y-%m-%dT%H:%M:00.000Z", date: "$at" } } },
            visitors: { $addToSet: visitorKey },
          },
        },
        { $project: { _id: 0, app: "$_id.app", minute: "$_id.minute", activeUsers: { $size: "$visitors" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: { $ne: "screen_view" } } },
        { $group: { _id: { app: "$app", name: "$name" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, app: "$_id.app", name: "$_id.name", count: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...match, name: "screen_view" } },
        { $group: { _id: { app: "$app", screen: "$props.screen" }, views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, app: "$_id.app", screen: "$_id.screen", views: 1 } },
      ]),
      AnalyticsEvent.find({ at: { $gte: since } })
        .sort({ at: -1 })
        .limit(50)
        .populate("user", "name phone")
        .select("name app user role props platform appVersion at")
        .lean(),
    ]);

    const apps = Object.fromEntries(
      ANALYTICS_APPS.map((app) => {
        const totals = perApp.find((r) => r._id === app);
        const now5 = activeNow.find((r) => r._id === app);
        return [
          app,
          {
            activeNow: now5?.activeNow ?? 0,
            activeUsers: totals?.activeUsers ?? 0,
            signedInUsers: totals?.signedInUsers ?? 0,
            events: totals?.events ?? 0,
          },
        ];
      })
    );

    // Zero-filled so the chart shows quiet minutes as 0 rather than skipping them.
    const minutesSeries = [];
    const start = new Date(since);
    start.setUTCSeconds(0, 0);
    for (let t = start.getTime() + 60 * 1000; t <= now.getTime(); t += 60 * 1000) {
      const minute = new Date(t).toISOString().replace(/:\d{2}\.\d{3}Z$/, ":00.000Z");
      const row: Record<string, string | number> = { minute };
      for (const app of ANALYTICS_APPS) {
        row[app] = perMinute.find((r) => r.app === app && r.minute === minute)?.activeUsers ?? 0;
      }
      minutesSeries.push(row);
    }

    return {
      generatedAt: now.toISOString(),
      windowMinutes: minutes,
      apps,
      perMinute: minutesSeries,
      topEvents,
      topScreens,
      recent,
    };
  }

  /** Daily active users and event counts per app, for the trend chart. */
  async getSummary(days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await AnalyticsEvent.aggregate([
      { $match: { at: { $gte: since } } },
      {
        $group: {
          _id: { app: "$app", day: { $dateToString: { format: "%Y-%m-%d", date: "$at", timezone: TIMEZONE } } },
          events: { $sum: 1 },
          visitors: { $addToSet: visitorKey },
        },
      },
      { $project: { _id: 0, app: "$_id.app", day: "$_id.day", events: 1, activeUsers: { $size: "$visitors" } } },
      { $sort: { day: 1 } },
    ]);

    const byDay = new Map<string, Record<string, string | number>>();
    for (const r of rows) {
      const entry: Record<string, string | number> = byDay.get(r.day) ?? { day: r.day };
      entry[`${r.app}Users`] = r.activeUsers;
      entry[`${r.app}Events`] = r.events;
      byDay.set(r.day, entry);
    }
    return { days, daily: [...byDay.values()] };
  }
}
