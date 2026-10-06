import type { FoodItem } from "../cartStore";

// GET /cart answers with whatever the test puts in `mockServerCart`; writes succeed.
let mockServerCart: any = { vendorId: null, items: [], changes: [] };
jest.mock("@/utils/api/custom-fetch", () => ({
  customFetch: jest.fn((path: string, init?: { method?: string }) =>
    Promise.resolve(path === "/cart" && !init?.method ? mockServerCart : {}),
  ),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(() => Promise.resolve(null)), setItem: jest.fn(() => Promise.resolve()), removeItem: jest.fn(() => Promise.resolve()) },
}));

import { useCartStore } from "../cartStore";

const item = (id: string, price: number): FoodItem => ({
  _id: id, name: `Item ${id}`, description: "", price, category: "main", isVeg: true, images: [],
});

beforeEach(() => {
  useCartStore.getState().reset();
  useCartStore.setState({ ownerId: "user-1", status: "ready" });
  useCartStore.getState().replaceCart("vendor-a", [
    { ...item("1", 100), quantity: 1 },
    { ...item("2", 50), quantity: 2 },
  ] as any);
});

describe("cart refresh", () => {
  it("drops a dish the restaurant deleted and says so", async () => {
    mockServerCart = {
      vendorId: "vendor-a",
      items: [{ itemId: "2", name: "Item 2", price: 50, quantity: 2 }],
      changes: [{ itemId: "1", name: "Item 1", status: "removed" }],
    };
    await useCartStore.getState().refresh();

    const state = useCartStore.getState();
    expect(state.items.map((i) => i._id)).toEqual(["2"]);
    expect(state.syncNotices).toEqual([{ itemId: "1", name: "Item 1", status: "removed" }]);
  });

  it("empties the cart when every dish is gone", async () => {
    mockServerCart = {
      vendorId: null,
      items: [],
      changes: [
        { itemId: "1", name: "Item 1", status: "removed" },
        { itemId: "2", name: "Item 2", status: "unavailable" },
      ],
    };
    await useCartStore.getState().refresh();

    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().vendorId).toBeNull();
  });

  it("leaves the cart alone when the server changed nothing", async () => {
    mockServerCart = { vendorId: "vendor-a", items: [], changes: [] };
    const before = useCartStore.getState().items;
    await useCartStore.getState().refresh();

    expect(useCartStore.getState().items).toBe(before);
    expect(useCartStore.getState().syncNotices).toEqual([]);
  });

  it("does nothing before the cart has been restored", async () => {
    useCartStore.setState({ status: "hydrating" });
    mockServerCart = { vendorId: null, items: [], changes: [{ itemId: "1", name: "Item 1", status: "removed" }] };
    await useCartStore.getState().refresh();

    expect(useCartStore.getState().items).toHaveLength(2);
  });
});
