import { amountInTransit, checkPayoutAmount, payoutBlocker } from "@/features/payouts/payoutRules";
import type { Payout } from "@/types/models";

describe("checkPayoutAmount", () => {
  const check = (input: string) => checkPayoutAmount(input, 100, 2500);

  it("accepts amounts typed the way people write money", () => {
    expect(check("1500")).toEqual({ amount: 1500 });
    expect(check("1,250")).toEqual({ amount: 1250 });
    expect(check(" ₹ 999.50 ")).toEqual({ amount: 999.5 });
  });

  it("allows exactly the minimum and exactly the whole balance", () => {
    expect(check("100")).toEqual({ amount: 100 });
    expect(check("2500")).toEqual({ amount: 2500 });
  });

  it("rejects amounts outside the minimum and the balance", () => {
    expect(check("99")).toEqual({ problem: "tooLow" });
    expect(check("2500.01")).toEqual({ problem: "tooHigh" });
  });

  it("rejects anything that isn't a plain amount", () => {
    for (const input of ["", "abc", "-200", "12.345", "1e3", "100.", "₹"]) {
      expect(check(input)).toEqual({ problem: "invalid" });
    }
  });
});

describe("amountInTransit", () => {
  const payout = (amount: number, status: Payout["status"]): Payout => ({ _id: `${amount}-${status}`, amount, status, requestedAt: "2026-10-01T10:00:00.000Z" });

  it("adds up requested and processing payouts only", () => {
    const payouts = [payout(500, "pending"), payout(300, "processing"), payout(1000, "processed"), payout(200, "failed")];
    expect(amountInTransit(payouts)).toBe(800);
    expect(amountInTransit([])).toBe(0);
  });
});

describe("payoutBlocker", () => {
  it("asks for a bank account before anything else", () => {
    expect(payoutBlocker(false, 5000, 100)).toBe("needsBank");
  });

  it("waits for the balance to reach the minimum", () => {
    expect(payoutBlocker(true, 99, 100)).toBe("belowMinimum");
    expect(payoutBlocker(true, 100, 100)).toBeNull();
  });
});
