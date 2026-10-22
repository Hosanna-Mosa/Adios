import { describe, expect, it } from "vitest";
import { DEFAULT_PERMISSIONS, fillCannedReply, formatMinutes } from "@/features/support/supportExtras";

describe("formatMinutes", () => {
  it("shows minutes, hours and days the way people read them", () => {
    expect(formatMinutes(null)).toBe("—");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(200)).toBe("3 h 20 min");
    expect(formatMinutes(28 * 60)).toBe("1 d 4 h");
    expect(formatMinutes(48 * 60)).toBe("2 d");
  });
});

describe("fillCannedReply", () => {
  it("puts the customer's first name where {{name}} is", () => {
    expect(fillCannedReply("Hi {{name}}, your refund is on its way.", "Asha Rao")).toBe("Hi Asha, your refund is on its way.");
    expect(fillCannedReply("Hi {{ NAME }}!", "Ravi")).toBe("Hi Ravi!");
  });

  it("falls back to a friendly word when there is no name", () => {
    expect(fillCannedReply("Hi {{name}},", "")).toBe("Hi there,");
    expect(fillCannedReply("Hi {{name}},", undefined)).toBe("Hi there,");
  });
});

describe("DEFAULT_PERMISSIONS", () => {
  it("leaves the sensitive abilities off until an admin grants them", () => {
    expect(DEFAULT_PERMISSIONS).not.toContain("export");
    expect(DEFAULT_PERMISSIONS).not.toContain("manage_canned");
    expect(DEFAULT_PERMISSIONS).toContain("reply");
  });
});
