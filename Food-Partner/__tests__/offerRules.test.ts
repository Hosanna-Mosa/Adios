import { EMPTY_OFFER, isExpired, offerSummary, validateOffer } from "@/features/offers/offerRules";
import type { PartnerOffer } from "@/types/insights";

const today = new Date("2026-03-10T08:00:00Z");
const valid = { ...EMPTY_OFFER, code: "WELCOME20", discountValue: "20" };

describe("validateOffer", () => {
  it("accepts a normal percentage offer", () => {
    expect(validateOffer(valid, today)).toEqual({});
  });

  it("wants a 3 to 20 character code of letters and numbers", () => {
    expect(validateOffer({ ...valid, code: "AB" }, today).code).toBe("codeInvalid");
    expect(validateOffer({ ...valid, code: "WELCOME 20" }, today).code).toBe("codeInvalid");
    expect(validateOffer({ ...valid, code: "A".repeat(21) }, today).code).toBe("codeInvalid");
  });

  it("keeps a percentage between 1 and 50", () => {
    expect(validateOffer({ ...valid, discountValue: "0" }, today).discountValue).toBe("percentInvalid");
    expect(validateOffer({ ...valid, discountValue: "51" }, today).discountValue).toBe("percentInvalid");
    expect(validateOffer({ ...valid, discountValue: "" }, today).discountValue).toBe("percentInvalid");
  });

  it("keeps a flat discount up to 500 and at or below the minimum order", () => {
    const flat = { ...valid, discountType: "FLAT" as const, discountValue: "100" };
    expect(validateOffer({ ...flat, minOrderValue: "300" }, today)).toEqual({});
    expect(validateOffer({ ...flat, discountValue: "600", minOrderValue: "900" }, today).discountValue).toBe("flatInvalid");
    expect(validateOffer({ ...flat, minOrderValue: "50" }, today).minOrderValue).toBe("minBelowDiscount");
    expect(validateOffer(flat, today).minOrderValue).toBe("minBelowDiscount");
  });

  it("needs a future expiry date in YYYY-MM-DD form", () => {
    expect(validateOffer({ ...valid, expiryDate: "2026-04-01" }, today)).toEqual({});
    expect(validateOffer({ ...valid, expiryDate: "2026-03-01" }, today).expiryDate).toBe("expiryInvalid");
    expect(validateOffer({ ...valid, expiryDate: "01/04/2026" }, today).expiryDate).toBe("expiryInvalid");
  });
});

describe("offer display", () => {
  const offer = (over: Partial<PartnerOffer>): PartnerOffer => ({ _id: "1", code: "X", discountType: "PERCENTAGE", discountValue: 20, isActive: true, usageCount: 0, ...over });
  const rupees = (n: number) => `₹${n}`;

  it("summarises the discount the way a customer reads it", () => {
    expect(offerSummary(offer({}), rupees)).toBe("20% off");
    expect(offerSummary(offer({ maxDiscount: 100 }), rupees)).toBe("20% off up to ₹100");
    expect(offerSummary(offer({ discountType: "FLAT", discountValue: 50 }), rupees)).toBe("₹50 off");
  });

  it("knows when an offer has expired", () => {
    expect(isExpired(offer({ expiryDate: "2026-03-01T00:00:00Z" }), today)).toBe(true);
    expect(isExpired(offer({ expiryDate: "2026-04-01T00:00:00Z" }), today)).toBe(false);
    expect(isExpired(offer({}), today)).toBe(false);
  });
});
