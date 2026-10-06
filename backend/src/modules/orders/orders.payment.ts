/**
 * Payment facts every driver-facing payload carries. Read from the stored order only —
 * never from anything a driver sends. Anything that is not a confirmed online payment is
 * reported as cash, so a driver is never told "paid online" for money that wasn't received.
 *
 * Its own file so both OrdersService and the food dispatcher can use it without
 * importing each other.
 */
export function driverPaymentInfo(order: any) {
  const paidOnline = order?.paymentMethod === "online" && order?.paymentStatus === "paid";
  return {
    paymentMethod: paidOnline ? "online" : "cash",
    paymentStatus: order?.paymentStatus || "pending",
    payableAmount: Math.round(Number(order?.totalPrice) || 0),
    cashCollected: !!order?.cashCollected,
  };
}
