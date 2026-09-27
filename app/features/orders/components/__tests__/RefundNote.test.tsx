import { refundNoteContent } from "../RefundNote";

const base = { paymentMethod: "online", paymentStatus: "paid", status: "CANCELLED", totalPrice: 349 };

describe("refundNoteContent", () => {
  it("a Razorpay refund reads as refunded to the original payment method", () => {
    expect(refundNoteContent({ ...base, refundStatus: "processed", refundAmount: 349, refundCompletedAt: "2026-09-25T06:24:05Z" }))
      .toEqual({ tone: "done", key: "refundedOriginal", amount: 349, completedAt: "2026-09-25T06:24:05Z" });
  });

  it("a manual refund carries its reference", () => {
    expect(refundNoteContent({ ...base, refundStatus: "processed", refundMethod: "manual", refundReference: "UPI-123" }))
      .toMatchObject({ key: "refundedManual", amount: 349, reference: "UPI-123" });
  });

  it("pending is in progress; failed or not started is being arranged", () => {
    expect(refundNoteContent({ ...base, refundStatus: "pending" })?.key).toBe("refundInProgress");
    expect(refundNoteContent({ ...base, refundStatus: "failed" })?.key).toBe("refundBeingArranged");
    expect(refundNoteContent({ ...base })?.key).toBe("refundBeingArranged");
  });

  it("nothing for cash orders, unpaid orders, or online orders that weren't cancelled", () => {
    expect(refundNoteContent({ ...base, paymentMethod: "cash", paymentStatus: "pending" })).toBeNull();
    expect(refundNoteContent({ ...base, paymentStatus: "pending" })).toBeNull();
    expect(refundNoteContent({ ...base, status: "DELIVERED" })).toBeNull();
  });
});
