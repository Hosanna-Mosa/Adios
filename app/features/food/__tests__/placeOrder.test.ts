// Food checkout's "Place order" (buildPlaceOrder): the guards that stop a bad order,
// the payload the server receives, cash vs online, and where the customer lands.

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockShowAlert = jest.fn();
const mockCreateOrder = jest.fn();
const mockGetVendor = jest.fn();
const mockPayOnline = jest.fn();
const mockDescribePaymentError = jest.fn();
const mockGetPaymentMethod = jest.fn();
const mockSetFoodStage = jest.fn();

jest.mock("expo-router", () => ({ router: { push: (...a: any[]) => mockRouterPush(...a), replace: (...a: any[]) => mockRouterReplace(...a) } }));
jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));
jest.mock("@/components/ui/AppAlert", () => ({ showAlert: (...a: any[]) => mockShowAlert(...a) }));
jest.mock("@/services/orders.service", () => ({ createOrder: (...a: any[]) => mockCreateOrder(...a) }));
jest.mock("@/services/catalog.service", () => ({ getVendor: (...a: any[]) => mockGetVendor(...a) }));
jest.mock("@/utils/razorpay", () => ({
  payOnlineAndPlaceOrder: (...a: any[]) => mockPayOnline(...a),
  describePaymentError: (...a: any[]) => mockDescribePaymentError(...a),
}));
jest.mock("@/contexts/paymentMethodStore", () => ({ getPaymentMethod: (...a: any[]) => mockGetPaymentMethod(...a) }));
jest.mock("@/contexts/deliveryStore", () => ({ useDeliveryStore: { getState: () => ({ setFoodStage: mockSetFoodStage }) } }));
jest.mock("@/contexts/foodStage", () => ({ foodStageOf: () => "awaiting_restaurant" }));

import { buildPlaceOrder } from "../useFoodCheckoutPlaceOrder.handlers";

const ADDRESS = {
  label: "Home",
  addressLine: "12 MG Road, Rajahmundry",
  receiverName: "Asha",
  landmark: "Near park",
  coordinates: { lat: 17.0, lng: 81.8 },
};

/** buildPlaceOrder takes 25 positional arguments; this names them. */
function setup(overrides: Record<string, any> = {}) {
  const v: Record<string, any> = {
    params: {},
    theme: "light",
    getItemCount: () => 2,
    vendorId: "64b000000000000000000001",
    items: [{ _id: "i1", name: "Biryani", quantity: 2, price: 120, images: ["img.jpg"], isVeg: false, category: "Mains" }],
    clearCart: jest.fn(),
    user: { _id: "u1" },
    token: "tok",
    setOrderId: jest.fn(),
    setStatus: jest.fn(),
    setServiceType: jest.fn(),
    selectedAddress: ADDRESS,
    setIsPlacingOrder: jest.fn(),
    appliedPromo: { code: "SAVE10" },
    vendorName: "Spice Hut",
    scheduledFor: null,
    setShowScheduleSheet: jest.fn(),
    subtotal: 240,
    deliveryFee: 30,
    activeTip: 10,
    discount: 24,
    total: 256,
    receiverName: "Asha",
    receiverPhone: "9876543210",
    addressIssue: null,
    ...overrides,
  };
  const place = buildPlaceOrder(
    v.params, v.theme, v.getItemCount, v.vendorId, v.items, v.clearCart, v.user, v.token, v.setOrderId, v.setStatus,
    v.setServiceType, v.selectedAddress, v.setIsPlacingOrder, v.appliedPromo, v.vendorName, v.scheduledFor,
    v.setShowScheduleSheet, v.subtotal, v.deliveryFee, v.activeTip, v.discount, v.total, v.receiverName, v.receiverPhone, v.addressIssue,
  );
  return { place, v };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPaymentMethod.mockReturnValue("cash");
  mockGetVendor.mockResolvedValue({ address: "Spice Hut, Main Rd", location: { coordinates: [81.79, 17.01] } });
  mockCreateOrder.mockResolvedValue({ _id: "ADSF161026123456" });
  mockPayOnline.mockResolvedValue({ _id: "ADSF161026999999" });
  mockDescribePaymentError.mockReturnValue(null);
});

describe("guards — nothing is ordered or charged", () => {
  it("an empty cart", async () => {
    const { place } = setup({ getItemCount: () => 0 });
    await place();
    expect(mockShowAlert).toHaveBeenCalledWith("app.food.cartIsEmpty", expect.any(String));
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("no session sends the customer to log in", async () => {
    const { place } = setup({ token: null });
    await place();
    expect(mockRouterPush).toHaveBeenCalledWith("/login");
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("an address without a map pin must be re-picked", async () => {
    const { place } = setup({ selectedAddress: { ...ADDRESS, coordinates: undefined } });
    await place();
    expect(mockRouterPush).toHaveBeenCalledWith("/delivery/saved-addresses");
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(mockPayOnline).not.toHaveBeenCalled();
  });

  it("a slot that has already passed reopens the schedule picker", async () => {
    const { place, v } = setup({ scheduledFor: new Date(Date.now() - 60_000) });
    await place();
    expect(v.setShowScheduleSheet).toHaveBeenCalledWith(true);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("a missing restaurant", async () => {
    const { place } = setup({ vendorId: null });
    await place();
    expect(mockShowAlert).toHaveBeenCalledWith("app.food.restaurantMissing", expect.any(String));
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});

describe("a cash order", () => {
  it("sends the outlet as pickup, the address pin as drop, and the items to the server", async () => {
    const { place } = setup();
    await place();

    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    const payload = mockCreateOrder.mock.calls[0][0];
    expect(payload).toMatchObject({
      serviceType: "delivery",
      vendorId: "64b000000000000000000001",
      paymentMethod: "cash",
      scheduledDelivery: { type: "now" },
      totals: { subtotal: 240, deliveryFee: 30, tip: 10, discount: 24, total: 256, couponCode: "SAVE10" },
    });
    const [pickup, drop] = payload.stops;
    expect(pickup).toMatchObject({ type: "pickup", latitude: 17.01, longitude: 81.79, address: "Spice Hut, Main Rd" });
    expect(drop).toMatchObject({ type: "drop", latitude: 17.0, longitude: 81.8 });
    expect(drop.items).toEqual([
      expect.objectContaining({ id: "i1", name: "Biryani", quantity: 2, price: 120, total: 240 }),
    ]);
    expect(drop.deliveryAddress).toMatchObject({ receiverPhone: "9876543210", landmark: "Near park" });
  });

  it("clears the cart and opens the driver search", async () => {
    const { place, v } = setup();
    await place();
    expect(v.setOrderId).toHaveBeenCalledWith("ADSF161026123456");
    expect(mockSetFoodStage).toHaveBeenCalledWith("awaiting_restaurant");
    expect(v.clearCart).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith({ pathname: "/finding-driver", params: { orderId: "ADSF161026123456" } });
    expect(v.setIsPlacingOrder).toHaveBeenLastCalledWith(false);
  });

  it("falls back to the drop point for pickup when the outlet's location can't be read", async () => {
    mockGetVendor.mockRejectedValue(new Error("offline"));
    const { place } = setup();
    await place();
    const [pickup] = mockCreateOrder.mock.calls[0][0].stops;
    expect(pickup).toMatchObject({ latitude: 17.0, longitude: 81.8, address: "Spice Hut" });
  });
});

describe("an online order", () => {
  it("goes through Razorpay for the total, never straight to createOrder", async () => {
    mockGetPaymentMethod.mockReturnValue("online");
    const { place, v } = setup();
    await place();
    expect(mockPayOnline).toHaveBeenCalledWith(256, expect.objectContaining({ serviceType: "delivery" }));
    expect(mockPayOnline.mock.calls[0][1]).not.toHaveProperty("paymentMethod");
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(v.setOrderId).toHaveBeenCalledWith("ADSF161026999999");
  });
});

describe("a scheduled order", () => {
  it("lands on My orders instead of the driver search", async () => {
    const slot = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const { place } = setup({ scheduledFor: slot });
    await place();
    expect(mockCreateOrder.mock.calls[0][0]).toMatchObject({
      scheduledFor: slot.toISOString(),
      scheduledDelivery: { type: "later", requestedAt: slot.toISOString() },
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/(tabs)/orders");
  });
});

describe("when placing fails", () => {
  it("shows the payment error, keeps the cart, and stops the spinner", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockCreateOrder.mockRejectedValue(new Error("Restaurant is closed"));
    mockDescribePaymentError.mockReturnValue(null);
    const { place, v } = setup();
    await place();
    expect(mockShowAlert).toHaveBeenCalledWith("app.food.orderFailed", "Restaurant is closed");
    expect(v.clearCart).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
    expect(v.setIsPlacingOrder).toHaveBeenLastCalledWith(false);
  });
});
