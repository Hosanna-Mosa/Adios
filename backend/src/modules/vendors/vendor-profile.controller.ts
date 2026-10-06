import { Response } from "express";
import type { Model } from "mongoose";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import { evaluateOutletOpenState } from "../../utils/openingHours";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];

// Only what the partner app shows. An allow-list, not a deny-list, so a new
// sensitive field on the model (password, kyc, legal/bank details…) can never
// reach the client by accident — unlike the public GET /vendors/:id.
const PROFILE_FIELDS =
  "name email phone partnerType address image rating reviews categories isPureVeg isOpen isManuallyClosed openingHours operations";

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
      return res.status(409).json({ message: "Your outlet was closed by the Flavour team. Contact support to reopen it." });
    }

    await model.updateOne({ _id: partner.id }, { $set: { isManuallyClosed: !isOpen } });
    return getMyVendorProfile(req, res);
  } catch (error) {
    console.error("Error updating outlet open state:", error);
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
