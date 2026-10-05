import mongoose from "mongoose";
import Vendor from "../database/models/Vendor";
import MeatCenter from "../database/models/MeatCenter";
import { evaluateOutletOpenState } from "./openingHours";

export interface OutletOrderingState {
  name: string;
  /** The partner's "Accepting orders" switch is off, or the outlet was closed by an admin. */
  manuallyClosed: boolean;
  /** Open right now: the switch is on and the current time is within its hours. */
  isOpen: boolean;
  label: string;
  opensAt: string | null;
}

/**
 * Whether a restaurant or meat centre is taking orders, looked up by the id a
 * food/meat order carries as its vendorId. Returns null for anything that
 * isn't an outlet (rides, courier and helper orders have no vendorId).
 */
export async function getOutletOrderingState(outletId: string | undefined | null): Promise<OutletOrderingState | null> {
  if (!outletId || !mongoose.Types.ObjectId.isValid(String(outletId))) return null;

  const fields = "name openingHours operations isManuallyClosed isOpen";
  const outlet: any =
    (await Vendor.findById(outletId).select(fields).lean()) ||
    (await MeatCenter.findById(outletId).select(fields).lean());
  if (!outlet) return null;

  const state = evaluateOutletOpenState(outlet);
  return {
    name: outlet.name || "This restaurant",
    manuallyClosed: outlet.isManuallyClosed === true || outlet.isOpen === false,
    isOpen: state.isOpen,
    label: state.label,
    opensAt: state.opensAt,
  };
}
