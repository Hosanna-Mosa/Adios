const mockCreatePaymentOrder = jest.fn();
const mockVerifyPayment = jest.fn();
const mockGetCheckoutStatus = jest.fn();
const mockOpenAuthSession = jest.fn();

jest.mock("@/services/payments.service", () => ({
  createPaymentOrder: (...a: any[]) => mockCreatePaymentOrder(...a),
  verifyPayment: (...a: any[]) => mockVerifyPayment(...a),
  getCheckoutStatus: (...a: any[]) => mockGetCheckoutStatus(...a),
}));
jest.mock("expo-web-browser", () => ({ openAuthSessionAsync: (...a: any[]) => mockOpenAuthSession(...a) }));
jest.mock("expo-linking", () => ({
  parse: (url: string) => ({ queryParams: Object.fromEntries(new URL(url.replace("flavour://", "http://x/")).searchParams) }),
}));
jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { ApiError } from "@/utils/api/custom-fetch";
import { payOnlineAndPlaceOrder } from "../razorpay";

const confirming = () =>
  Object.assign(Object.create(ApiError.prototype), { data: { code: "CONFIRMING" }, status: 409 });

beforeEach(() => {
  jest.useFakeTimers();
  [mockCreatePaymentOrder, mockVerifyPayment, mockGetCheckoutStatus, mockOpenAuthSession].forEach((m) => m.mockReset());
  mockCreatePaymentOrder.mockResolvedValue({ id: "order_1", checkoutUrl: "https://x/checkout", returnUrl: "flavour://payment-result" });
  mockOpenAuthSession.mockResolvedValue({
    type: "success",
    url: "flavour://payment-result?status=success&razorpay_order_id=order_1&razorpay_payment_id=pay_1&razorpay_signature=sig",
  });
});
afterEach(() => jest.useRealTimers());

it("keeps confirming until the server has placed the order", async () => {
  mockVerifyPayment.mockRejectedValueOnce(confirming()).mockResolvedValueOnce({ order: { _id: "F1" } });

  const promise = payOnlineAndPlaceOrder(325, { stops: [] });
  await jest.runAllTimersAsync();

  await expect(promise).resolves.toEqual({ _id: "F1" });
  expect(mockVerifyPayment).toHaveBeenCalledTimes(2);
  expect(mockVerifyPayment).toHaveBeenCalledWith({
    razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "sig",
  });
});

it("does not retry other errors", async () => {
  const other = Object.assign(Object.create(ApiError.prototype), { data: { code: "INVALID_PAYMENT" }, status: 400 });
  mockVerifyPayment.mockRejectedValue(other);

  await expect(payOnlineAndPlaceOrder(325, {})).rejects.toBe(other);
  expect(mockVerifyPayment).toHaveBeenCalledTimes(1);
});
