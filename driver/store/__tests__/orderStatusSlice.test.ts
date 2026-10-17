jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));
jest.mock("@/utils/apiUrl", () => ({ API_URL: "https://api.test/api/v1" }));
jest.mock("@/utils/analytics", () => ({ trackEvent: jest.fn() }));
const mockEmit = jest.fn();
jest.mock("../../utils/socketService", () => ({ socketService: { emit: (...a: any[]) => mockEmit(...a) } }));

import { createOrderStatusSlice } from "../slices/orderStatusSlice";

// The active job's lifecycle as the store runs it: each step is the server's to accept,
// and the job only moves on when the server says so.

function makeStore(initial: Record<string, any>) {
  let state: Record<string, any> = { ...initial };
  const set = (partial: any) => {
    state = { ...state, ...(typeof partial === "function" ? partial(state) : partial) };
  };
  const get = () => state as any;
  const slice = createOrderStatusSlice(set as any, get as any);
  return { slice, state: () => state };
}

const currentOrder = {
  id: "ADSF161026123456",
  status: "arrived_pickup",
  serviceType: "delivery",
  earnings: 279,
  stops: [],
  customerName: "Asha",
};

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  mockEmit.mockReset();
  (global as any).fetch = fetchMock;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

const response = (ok: boolean, body: any) => ({ ok, json: async () => body });

describe("updateOrderStatus", () => {
  it("sends the status and code, then takes the server's version of the order", async () => {
    fetchMock.mockResolvedValue(response(true, { _id: "ADSF161026123456", status: "en_route_delivery", totalPrice: 349, stops: [] }));
    const { slice, state } = makeStore({ currentOrder, token: "tok" });

    await slice.updateOrderStatus("en_route_delivery" as any, "4821");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/orders/ADSF161026123456/status");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ status: "en_route_delivery", otp: "4821" });
    expect(state().currentOrder.status).toBe("en_route_delivery");
    expect(mockEmit).toHaveBeenCalledWith("order_status_update", { orderId: "ADSF161026123456", status: "en_route_delivery" });
  });

  it("a refused step throws the server's reason and leaves the job where it was", async () => {
    fetchMock.mockResolvedValue(response(false, { message: "Invalid restaurant pickup code." }));
    const { slice, state } = makeStore({ currentOrder, token: "tok" });

    await expect(slice.updateOrderStatus("en_route_delivery" as any, "0000")).rejects.toThrow("Invalid restaurant pickup code.");
    expect(state().currentOrder.status).toBe("arrived_pickup");
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it("does nothing without an active job", async () => {
    const { slice } = makeStore({ currentOrder: null, token: "tok" });
    await slice.updateOrderStatus("en_route_delivery" as any);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("confirmCashCollected", () => {
  it("only the server's answer marks the cash as collected", async () => {
    fetchMock.mockResolvedValue(response(true, { _id: "ADSF161026123456", status: "arrived_delivery", totalPrice: 349, cashCollected: true, cashCollectedAmount: 349, stops: [] }));
    const { slice, state } = makeStore({ currentOrder, token: "tok" });

    await slice.confirmCashCollected(349);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ amount: 349 });
    expect(state().currentOrder.cashCollected).toBe(true);
  });

  it("a mismatched amount is refused with the server's message", async () => {
    fetchMock.mockResolvedValue(response(false, { message: "This order needs ₹349." }));
    const { slice, state } = makeStore({ currentOrder, token: "tok" });

    await expect(slice.confirmCashCollected(300)).rejects.toThrow("This order needs ₹349.");
    expect(state().currentOrder.cashCollected).toBeUndefined();
  });

  it("needs a session", async () => {
    const { slice } = makeStore({ currentOrder, token: null });
    await expect(slice.confirmCashCollected(349)).rejects.toThrow("auth.pleaseSignInAgain");
  });
});
