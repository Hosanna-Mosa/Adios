import Offer from "../../database/models/Offer";
import { evaluateOutletOpenState } from "../../utils/openingHours";

// Explicit allow-list: the public endpoint must never carry password, kyc,
// legal, bank or token fields. The hours fields are only read to compute
// isOpen and are dropped from the output.
const PUBLIC_VENDOR_FIELDS = "name image rating reviews address isPureVeg categories partnerType";
const HOURS_FIELDS =
  "openingHours isOpen isManuallyClosed operations.selectedDays operations.timeSlots operations.dayTimeSlots";

export class OffersService {
  /** Live offers: active, inside their date window, on an outlet that still exists. */
  async listActiveOffers(now = new Date()) {
    const offers = await Offer.find({
      isActive: true,
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      ],
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate("vendor", `${PUBLIC_VENDOR_FIELDS} ${HOURS_FIELDS}`)
      .lean();

    return offers
      .filter((offer: any) => offer.vendor && typeof offer.vendor === "object")
      .map((offer: any) => {
        const { openingHours, isOpen, isManuallyClosed, operations, ...vendor } = offer.vendor;
        const openState = evaluateOutletOpenState({ openingHours, isOpen, isManuallyClosed, operations });
        return { ...offer, vendor: { ...vendor, isOpen: openState.isOpen } };
      });
  }
}
