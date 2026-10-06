import type { Payout } from "@/types/models";

// The Payouts screen's rules, kept free of React so they are unit-tested.

export type AmountProblem = "invalid" | "tooLow" | "tooHigh";

/**
 * The rupee amount typed into the request sheet, or why it can't be requested.
 * Accepts "1,250", "₹ 1250" and up to two decimals, as people type money.
 */
export function checkPayoutAmount(
  input: string,
  minimum: number,
  available: number,
): { amount: number } | { problem: AmountProblem } {
  const cleaned = input.replace(/[\s,₹]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { problem: "invalid" };
  const amount = Number(cleaned);
  if (amount < minimum) return { problem: "tooLow" };
  if (amount > available) return { problem: "tooHigh" };
  return { amount };
}

/** Money requested but not in the bank yet — already taken off the available balance. */
export function amountInTransit(payouts: Payout[]): number {
  return payouts
    .filter((payout) => payout.status === "pending" || payout.status === "processing")
    .reduce((sum, payout) => sum + payout.amount, 0);
}

/** Why "Request payout" is unavailable, or null when it can be used. */
export function payoutBlocker(hasBankAccount: boolean, available: number, minimum: number): "needsBank" | "belowMinimum" | null {
  if (!hasBankAccount) return "needsBank";
  if (available < minimum) return "belowMinimum";
  return null;
}
