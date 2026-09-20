import type { FoodItem } from "../cartStore";

// The store pushes every mutation to /cart on a debounce. Tests care about the
// local cart, not the wire, so the transport is stubbed out.
jest.mock("@/utils/api/custom-fetch", () => ({
  customFetch: jest.fn(() => Promise.resolve({})),
}));

import { useCartStore } from "../cartStore";

const item = (id: string, price: number, name = `Item ${id}`): FoodItem => ({
  _id: id,
  name,
  description: "",
  price,
  category: "main",
  isVeg: true,
  images: [],
});

const VENDOR_A = "vendor-a";
const VENDOR_B = "vendor-b";

beforeEach(() => {
  jest.useFakeTimers();
  useCartStore.getState().reset();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("requestAddItem", () => {
  it("adds a new item with quantity 1 and records the vendor", () => {
    const result = useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A, "Outlet A");

    expect(result).toBe("added");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().vendorId).toBe(VENDOR_A);
    expect(useCartStore.getState().vendorName).toBe("Outlet A");
  });

  it("increments quantity when the same item is added twice", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("keeps separate lines for different items from the same vendor", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().requestAddItem(item("2", 50), VENDOR_A);

    expect(useCartStore.getState().items.map((i) => i._id)).toEqual(["1", "2"]);
  });
});

describe("vendor conflict", () => {
  it("refuses an item from a second vendor and raises a pending conflict", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A, "Outlet A");
    const result = useCartStore.getState().requestAddItem(item("9", 70), VENDOR_B, "Outlet B");

    expect(result).toBe("conflict");
    // The existing cart must be left exactly as it was.
    expect(useCartStore.getState().items.map((i) => i._id)).toEqual(["1"]);
    expect(useCartStore.getState().vendorId).toBe(VENDOR_A);
    expect(useCartStore.getState().pendingConflict).toMatchObject({
      vendorId: VENDOR_B,
      vendorName: "Outlet B",
    });
  });

  it("does not conflict when the cart is empty", () => {
    expect(useCartStore.getState().requestAddItem(item("9", 70), VENDOR_B)).toBe("added");
    expect(useCartStore.getState().pendingConflict).toBeNull();
  });

  it("'keep' discards the pending item and leaves the cart untouched", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().requestAddItem(item("9", 70), VENDOR_B);

    useCartStore.getState().resolveConflict("keep");

    expect(useCartStore.getState().items.map((i) => i._id)).toEqual(["1"]);
    expect(useCartStore.getState().vendorId).toBe(VENDOR_A);
    expect(useCartStore.getState().pendingConflict).toBeNull();
  });

  it("'clear' empties the cart and adds the pending item alone", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().requestAddItem(item("9", 70), VENDOR_B, "Outlet B");

    useCartStore.getState().resolveConflict("clear");

    expect(useCartStore.getState().items.map((i) => i._id)).toEqual(["9"]);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().vendorId).toBe(VENDOR_B);
    expect(useCartStore.getState().vendorName).toBe("Outlet B");
    expect(useCartStore.getState().pendingConflict).toBeNull();
  });

  it("is a no-op when there is no pending conflict", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().resolveConflict("clear");

    expect(useCartStore.getState().items.map((i) => i._id)).toEqual(["1"]);
  });
});

describe("quantity and removal", () => {
  it("updateQuantity(0) removes the line", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().updateQuantity("1", 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("clears the vendor once the last item is removed", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A, "Outlet A");
    useCartStore.getState().removeItem("1");

    expect(useCartStore.getState().vendorId).toBeNull();
    expect(useCartStore.getState().vendorName).toBeNull();
  });

  it("keeps the vendor while other items remain", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A, "Outlet A");
    useCartStore.getState().requestAddItem(item("2", 50), VENDOR_A);
    useCartStore.getState().removeItem("1");

    expect(useCartStore.getState().vendorId).toBe(VENDOR_A);
  });
});

describe("replaceCart", () => {
  it("drops the vendor when replaced with an empty list", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A, "Outlet A");
    useCartStore.getState().replaceCart(VENDOR_A, [], "Outlet A");

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().vendorId).toBeNull();
  });
});

describe("totals", () => {
  it("multiplies price by quantity across lines", () => {
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A);
    useCartStore.getState().requestAddItem(item("1", 100), VENDOR_A); // qty 2
    useCartStore.getState().requestAddItem(item("2", 50), VENDOR_A);

    expect(useCartStore.getState().getTotalPrice()).toBe(250);
    expect(useCartStore.getState().getItemCount()).toBe(3);
  });

  it("is zero for an empty cart", () => {
    expect(useCartStore.getState().getTotalPrice()).toBe(0);
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });
});
