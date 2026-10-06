import { formatOrderId } from "@/utils/format";

jest.mock("@/i18n", () => ({ __esModule: true, default: { language: "en" } }));

describe("formatOrderId", () => {
  it("shows generated order ids in full, as the customer and rider apps do", () => {
    expect(formatOrderId("ADSF051026172971")).toBe("ADSF051026172971");
    expect(formatOrderId("ADSR051026334560")).toBe("ADSR051026334560");
  });

  it("keeps seeded ORD- ids as they are", () => {
    expect(formatOrderId("ORD-1042")).toBe("ORD-1042");
  });

  it("still shortens a bare Mongo id", () => {
    expect(formatOrderId("6a7713e27f110f6587148fa7")).toBe("#148FA7");
    expect(formatOrderId("6a7713e27f110f6587148fa7", false)).toBe("#6A7713E27F110F6587148FA7");
  });

  it("is empty without an id", () => {
    expect(formatOrderId(undefined)).toBe("");
  });
});
