import { cartKey, fromWire, toWire } from "../cart.wire";
import type { CartItem } from "../cart.types";

// These two functions are the app's defence against a malformed cart row
// reaching the UI, so the tests focus on the coercion rather than the happy path.

const item = (over: Partial<CartItem> = {}): CartItem => ({
  _id: "1",
  name: "Biryani",
  description: "Spicy",
  price: 200,
  category: "main",
  isVeg: false,
  images: ["a.png"],
  quantity: 2,
  ...over,
});

describe("cartKey", () => {
  it("namespaces the cart per account", () => {
    expect(cartKey("user-1")).toBe("cart:user-1");
    expect(cartKey("user-2")).not.toBe(cartKey("user-1"));
  });
});

describe("toWire", () => {
  it("maps _id to itemId and keeps the rest", () => {
    const [row] = toWire([item()]);
    expect(row.itemId).toBe("1");
    expect(row.name).toBe("Biryani");
    expect(row.quantity).toBe(2);
  });

  it("substitutes a name for an unnamed item", () => {
    expect(toWire([item({ name: "" })])[0].name).toBe("Item");
  });

  it("coerces a non-numeric price to 0", () => {
    expect(toWire([item({ price: "abc" as any })])[0].price).toBe(0);
  });

  it("never sends a quantity below 1, and rounds fractions", () => {
    expect(toWire([item({ quantity: 0 })])[0].quantity).toBe(1);
    expect(toWire([item({ quantity: -5 })])[0].quantity).toBe(1);
    expect(toWire([item({ quantity: 2.6 })])[0].quantity).toBe(3);
  });

  it("treats a missing isVeg as veg, and only false as non-veg", () => {
    expect(toWire([item({ isVeg: undefined as any })])[0].isVeg).toBe(true);
    expect(toWire([item({ isVeg: false })])[0].isVeg).toBe(false);
  });

  it("drops non-string entries from images", () => {
    expect(toWire([item({ images: ["a.png", null as any, 3 as any] })])[0].images).toEqual(["a.png"]);
  });
});

describe("fromWire", () => {
  it("reads itemId, falling back to _id", () => {
    expect(fromWire([{ itemId: "a" }])[0]._id).toBe("a");
    expect(fromWire([{ _id: "b" }])[0]._id).toBe("b");
  });

  it("drops rows with no id at all", () => {
    expect(fromWire([{ name: "orphan" }, { itemId: "a" }])).toHaveLength(1);
  });

  it("promotes a single `image` to the images array", () => {
    expect(fromWire([{ itemId: "a", image: "x.png" }])[0].images).toEqual(["x.png"]);
  });

  it("prefers a non-empty images array over `image`", () => {
    expect(fromWire([{ itemId: "a", images: ["y.png"], image: "x.png" }])[0].images).toEqual(["y.png"]);
  });

  it("survives null and undefined input", () => {
    expect(fromWire(null as any)).toEqual([]);
    expect(fromWire([null as any, { itemId: "a" }])).toHaveLength(1);
  });

  it("round-trips an item through toWire and back", () => {
    const [back] = fromWire(toWire([item()]));
    expect(back).toMatchObject({ _id: "1", name: "Biryani", price: 200, quantity: 2, isVeg: false });
  });
});
