import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Model } from "mongoose";
import AdminAuditLog from "../database/models/AdminAuditLog";
import Banner from "../database/models/Banner";
import Coupon from "../database/models/Coupon";
import Driver from "../database/models/Driver";
import MeatCenter from "../database/models/MeatCenter";
import Offer from "../database/models/Offer";
import SystemConfig from "../database/models/SystemConfig";
import User, { UserRole } from "../database/models/User";
import Vendor from "../database/models/Vendor";
import Zone from "../database/models/Zone";
import type { AuthRequest } from "./auth.middleware";

// Records every successful write an admin or support member makes — blocking a user, verifying a
// driver, a refund or payout, pricing, coupons — in the append-only AdminAuditLog. It watches
// the whole API rather than the admin routes alone, because staff also act through shared
// routes (e.g. cancelling an order). Requests from anyone else are not touched.

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const STAFF_ROLES = new Set<string>([UserRole.ADMIN, UserRole.SUPPORT]);

/** First path segment (after /api/v1 and an optional /admin) → the collection a following :id belongs to. */
const RESOURCES: Record<string, { type: string; model: Model<any> }> = {
  users: { type: "User", model: User },
  drivers: { type: "Driver", model: Driver },
  vendors: { type: "Vendor", model: Vendor },
  meat: { type: "MeatCenter", model: MeatCenter },
  "support-members": { type: "User", model: User },
  coupons: { type: "Coupon", model: Coupon },
  zones: { type: "Zone", model: Zone },
  banners: { type: "Banner", model: Banner },
  offers: { type: "Offer", model: Offer },
};

const SECRET_KEY = /pass(word)?|otp|token|secret|pin$|authorization|cvv|card/i;
const MAX_STRING = 500;
const MAX_JSON = 8000;

/** A copy that is safe to store: secrets dropped, long text cut, depth and size capped. */
export function sanitizeForAudit(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (depth >= 4) return "[nested]";
  if (Array.isArray(value)) return value.slice(0, 25).map((v) => sanitizeForAudit(v, depth + 1));
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("$")) continue;
      out[key] = SECRET_KEY.test(key) ? "[redacted]" : sanitizeForAudit(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

const capped = (value: unknown) => {
  const clean = sanitizeForAudit(value);
  try {
    return JSON.stringify(clean).length > MAX_JSON ? { truncated: true } : clean;
  } catch {
    return undefined;
  }
};

const looksLikeId = (segment: string) => /^[0-9a-f]{24}$/i.test(segment) || /^[A-Za-z]*[-_]?\d{4,}/.test(segment) || /^[0-9a-f-]{32,36}$/i.test(segment);

/** Path without the API prefix and query, and the thing it targets, if it names one. */
export function describeRequest(originalUrl: string) {
  const path = originalUrl.split("?")[0].replace(/^\/api\/v1/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  const ids: string[] = [];
  const generic = segments.map((s) => {
    if (looksLikeId(s)) {
      ids.push(s);
      return ":id";
    }
    return s;
  });
  const first = segments[0] === "admin" ? segments[1] : segments[0];
  const resource = first ? RESOURCES[first] : undefined;
  const config = segments[0] === "admin" && segments[1] === "config";
  return {
    path,
    pattern: `/${generic.join("/")}`,
    targetId: ids[0],
    resource,
    config,
    targetType: config ? "SystemConfig" : resource && ids[0] ? resource.type : first,
  };
}

/** Only the fields a request is about to change, read straight from the stored document. */
async function snapshot(described: ReturnType<typeof describeRequest>, keys: string[]) {
  if (described.config) {
    const doc = await SystemConfig.findOne({ key: "global_settings" }).lean<{ value?: Record<string, unknown> }>();
    const value = doc?.value ?? {};
    return capped(Object.fromEntries(keys.map((k) => [k, value[k]])));
  }
  if (!described.resource || !described.targetId) return undefined;
  const doc = await described.resource.model.findById(described.targetId).lean<Record<string, unknown>>();
  if (!doc) return undefined;
  // A request field and the stored field are not always named the same.
  const stored = (key: string) => (key === "permissions" && described.resource?.type === "User" ? "supportPermissions" : key);
  return capped(Object.fromEntries(keys.filter((k) => !SECRET_KEY.test(k)).map((k) => [k, doc[stored(k)]])));
}

/**
 * Records an action that is not a write — a data export — in the same trail, so who downloaded
 * what and when can be answered. Never throws: the trail must not take a request down.
 */
export async function recordAuditEvent(req: Request, action: string, targetType: string, details?: unknown) {
  try {
    const user = (req as AuthRequest).user;
    if (!user) return;
    const actor = await User.findById(user.userId).select("name").lean<{ name?: string }>();
    await AdminAuditLog.create({
      actorId: String(user.userId),
      actorName: actor?.name,
      actorRole: String(user.role),
      action,
      method: req.method,
      path: req.originalUrl.split("?")[0].replace(/^\/api\/v1/, ""),
      targetType,
      request: capped(details),
      statusCode: 200,
      ip: req.ip,
    });
  } catch (error) {
    console.error("[audit] Failed to record admin event:", error);
  }
}

const claimsStaff = (header?: string) => {
  const token = header?.split(" ")[1];
  const claims = token ? (jwt.decode(token) as { role?: string } | null) : null;
  return !!claims?.role && STAFF_ROLES.has(claims.role);
};

export async function auditAdminActions(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING.has(req.method) || !claimsStaff(req.headers.authorization)) return next();

  const described = describeRequest(req.originalUrl);
  const body = req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
  const bodyKeys = Object.keys(body).filter((k) => !k.startsWith("$"));
  // A delete or a toggle has no body: keep a few identifying fields of what is being changed.
  const keys = bodyKeys.length === 0 && req.method !== "POST" ? ["name", "email", "phone", "status", "title", "code", "isBlocked", "isActive", "isOpen"] : bodyKeys;
  // Read before the handler runs, so `before` is what the action actually replaced.
  const before = req.method === "POST" ? undefined : await snapshot(described, keys).catch(() => undefined);

  res.on("finish", () => {
    const user = (req as AuthRequest).user;
    // Only a verified staff request that succeeded — the token decoded above was never checked.
    if (!user || !STAFF_ROLES.has(String(user.role)) || res.statusCode >= 400) return;
    void (async () => {
      try {
        const [after, actor] = await Promise.all([
          req.method === "DELETE" || req.method === "POST" ? undefined : snapshot(described, keys).catch(() => undefined),
          User.findById(user.userId).select("name").lean<{ name?: string }>().catch(() => null),
        ]);
        await AdminAuditLog.create({
          actorId: String(user.userId),
          actorName: actor?.name,
          actorRole: String(user.role),
          action: `${req.method} ${described.pattern}`,
          method: req.method,
          path: described.path,
          targetType: described.targetType,
          targetId: described.targetId,
          before,
          after,
          request: capped(body),
          statusCode: res.statusCode,
          ip: req.ip,
        });
      } catch (error) {
        // The trail must never take a request down with it.
        console.error("[audit] Failed to record admin action:", error);
      }
    })();
  });
  next();
}
