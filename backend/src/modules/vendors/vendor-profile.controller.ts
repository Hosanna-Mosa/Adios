import { Response } from "express";
import type { Model } from "mongoose";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import { DAY_KEYS, evaluateOutletOpenState, weeklyHoursFromOperations, type DayHours, type WeeklyHours } from "../../utils/openingHours";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];

/**
 * The week the outlet actually runs on, as the partner app's hours editor shows
 * it: the saved openingHours, else the onboarding schedule it falls back to.
 * null = no schedule at all, i.e. open whenever the switch is on.
 */
const effectiveWeek = (openingHours: unknown, operations: unknown): Record<string, DayHours> | null => {
  const saved = openingHours && typeof openingHours === "object" && Object.keys(openingHours).length ? (openingHours as WeeklyHours) : undefined;
  const week = saved ?? weeklyHoursFromOperations(operations as Parameters<typeof weeklyHoursFromOperations>[0]);
  if (!week) return null;
  const out: Record<string, DayHours> = {};
  for (const day of DAY_KEYS) {
    const entry = week[day];
    out[day] = entry?.closed || !entry?.open || !entry?.close
      ? { open: entry?.open || "09:00", close: entry?.close || "22:00", closed: true }
      : { open: entry.open, close: entry.close, closed: false };
  }
  return out;
};

// Only what the partner app shows. An allow-list, not a deny-list, so a new
// sensitive field on the model (password, kyc, legal/bank details…) can never
// reach the client by accident — unlike the public GET /vendors/:id.
const PROFILE_FIELDS =
  "name email phone partnerType address image rating reviews categories isPureVeg isOpen isManuallyClosed openingHours operations branchCode currentLocation";

// Owner's phone, a manager's phone, the kitchen tablet… plus slack for devices
// that were reinstalled without signing out. The oldest registration drops off.
const MAX_PUSH_DEVICES = 10;

/** The signed-in partner's outlet id and role, or null for any other token. */
const partnerOf = (req: AuthRequest) => {
  const id = req.user?.userId;
  const role = String(req.user?.role || "");
  return id && VENDOR_ROLES.includes(role) ? { id: String(id), role } : null;
};

/**
 * Which collection holds the outlet: a Vendor, or — for a meat vendor — possibly
 * a legacy MeatCenter. Typed as `Model<any>` because TS can't merge the two
 * models' overloaded update signatures into one callable union.
 */
const outletModelFor = async (id: string, role: string): Promise<Model<any> | null> => {
  if (await Vendor.exists({ _id: id })) return Vendor;
  if (role === "meat_vendor" && (await MeatCenter.exists({ _id: id }))) return MeatCenter;
  return null;
};

/**
 * GET /api/v1/vendors/me — the signed-in outlet's own profile, read fresh from
 * the database. Vendor and meat-centre tokens carry the outlet's _id; a meat
 * vendor may be a Vendor (partnerType "meat") or a legacy MeatCenter, the same
 * split /vendors/login and /meat/login cover.
 */
export const getMyVendorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const partner = partnerOf(req);
    if (!partner) {
      return res.status(403).json({ message: "Only partner accounts have an outlet profile" });
    }
    const { id, role } = partner;

    const vendor = await Vendor.findById(id).select(PROFILE_FIELDS).lean();
    const outlet = vendor ?? (role === "meat_vendor" ? await MeatCenter.findById(id).select(PROFILE_FIELDS).lean() : null);
    if (!outlet) return res.status(404).json({ message: "Outlet not found" });

    const { openingHours, operations, ...profile } = outlet as typeof outlet & { operations?: unknown };
    const openState = evaluateOutletOpenState({ ...outlet, openingHours, operations } as Parameters<typeof evaluateOutletOpenState>[0]);
    return res.json({
      ...profile,
      role: vendor && vendor.partnerType !== "meat" ? "restaurant_vendor" : "meat_vendor",
      partnerType: vendor?.partnerType ?? "meat",
      openState: { isOpen: openState.isOpen, label: openState.label, today: openState.today },
      openingHours: effectiveWeek(openingHours, operations),
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/v1/vendors/me/open — the partner app's "Accepting orders" switch.
 * It only sets the manual-close flag: opening hours still apply, so an outlet
 * switched on outside its hours stays closed until it opens. An admin's
 * isOpen=false outranks the partner, who is told to contact support instead.
 * Answers with the fresh profile, so the app shows the resulting open state.
 */
export const setMyOpenState = async (req: AuthRequest, res: Response) => {
  try {
    const partner = partnerOf(req);
    if (!partner) return res.status(403).json({ message: "Only partner accounts can open or close an outlet" });

    const model = await outletModelFor(partner.id, partner.role);
    if (!model) return res.status(404).json({ message: "Outlet not found" });

    const { isOpen } = req.body as { isOpen: boolean };
    const current = await model.findById(partner.id).select("isOpen").lean<{ isOpen?: boolean }>();
    if (isOpen && current?.isOpen === false) {
      return res.status(409).json({ message: "Your outlet was closed by the Adios team. Contact support to reopen it." });
    }

    await model.updateOne({ _id: partner.id }, { $set: { isManuallyClosed: !isOpen } });
    return getMyVendorProfile(req, res);
  } catch (error) {
    console.error("Error updating outlet open state:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

type ProfileUpdateBody = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  image?: string;
  branchCode?: string | null;
  currentLocation?: { lat: number; lng: number; address?: string } | null;
  openingHours?: Record<string, DayHours>;
};

/**
 * PUT /api/v1/vendors/me — the partner edits its own outlet details. Only the
 * fields below are writable (strings arrive trimmed from the Zod schema). An
 * empty or null branchCode, or a null currentLocation, removes the field.
 * currentLocation is informational and never moves the searchable `location`.
 * Answers with the fresh profile, the same shape as GET /vendors/me.
 */
export const updateMyVendorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const partner = partnerOf(req);
    if (!partner) return res.status(403).json({ message: "Only partner accounts can edit an outlet profile" });

    const model = await outletModelFor(partner.id, partner.role);
    if (!model) return res.status(404).json({ message: "Outlet not found" });

    const body = req.body as ProfileUpdateBody;
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, ""> = {};

    for (const field of ["name", "phone", "email", "address", "image"] as const) {
      if (body[field] !== undefined) $set[field] = body[field];
    }
    if (body.branchCode !== undefined) {
      if (body.branchCode) $set.branchCode = body.branchCode;
      else $unset.branchCode = "";
    }
    if (body.currentLocation !== undefined) {
      if (body.currentLocation) {
        const { lat, lng, address } = body.currentLocation;
        $set.currentLocation = address ? { lat, lng, address } : { lat, lng };
      } else {
        $unset.currentLocation = "";
      }
    }

    if (body.openingHours) {
      // Always a full week, so the onboarding schedule never fills in a missing day.
      $set.openingHours = Object.fromEntries(
        DAY_KEYS.map((day) => {
          const entry = body.openingHours![day];
          return [day, { open: entry.open, close: entry.close, closed: entry.closed === true }];
        }),
      );
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    if (Object.keys(update).length) {
      await model.updateOne({ _id: partner.id }, update, { runValidators: true });
    }
    return getMyVendorProfile(req, res);
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      const label = field === "email" ? "email" : field === "phone" ? "phone number" : "value";
      return res.status(409).json({ message: `That ${label} is already used by another account` });
    }
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error updating vendor profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/v1/vendors/me/push-token — registers this device for order alerts.
 * A token belongs to one installation, so it is first taken off any other
 * outlet: a shared kitchen tablet that switches accounts must stop ringing for
 * the old one. The newest MAX_PUSH_DEVICES registrations are kept.
 */
export const registerMyPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const partner = partnerOf(req);
    if (!partner) return res.status(403).json({ message: "Only partner accounts can register for order alerts" });

    const model = await outletModelFor(partner.id, partner.role);
    if (!model) return res.status(404).json({ message: "Outlet not found" });

    const { expoPushToken } = req.body as { expoPushToken: string };
    const elsewhere = { expoPushTokens: expoPushToken, _id: { $ne: partner.id } };
    await Promise.all([
      Vendor.updateMany(elsewhere, { $pull: { expoPushTokens: expoPushToken } }),
      MeatCenter.updateMany(elsewhere, { $pull: { expoPushTokens: expoPushToken } }),
    ]);

    // Re-registering moves the token to the newest end, so $slice drops the stalest device.
    await model.updateOne({ _id: partner.id }, { $pull: { expoPushTokens: expoPushToken } });
    await model.updateOne(
      { _id: partner.id },
      { $push: { expoPushTokens: { $each: [expoPushToken], $slice: -MAX_PUSH_DEVICES } } }
    );
    return res.json({ message: "Push token registered" });
  } catch (error) {
    console.error("Error registering partner push token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** DELETE /api/v1/vendors/me/push-token — sign-out: this device stops getting the outlet's alerts. */
export const removeMyPushToken = async (req: AuthRequest, res: Response) => {
  try {
    const partner = partnerOf(req);
    if (!partner) return res.status(403).json({ message: "Only partner accounts have order alerts" });

    const model = await outletModelFor(partner.id, partner.role);
    if (model) {
      const { expoPushToken } = req.body as { expoPushToken: string };
      await model.updateOne({ _id: partner.id }, { $pull: { expoPushTokens: expoPushToken } });
    }
    return res.json({ message: "Push token removed" });
  } catch (error) {
    console.error("Error removing partner push token:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
