import { getPaymentMethod, usePaymentMethodStore } from "../paymentMethodStore";

describe("paymentMethodStore", () => {
  it("keeps each flow's previous behaviour as its default", () => {
    expect(getPaymentMethod("food")).toBe("online");
    expect(getPaymentMethod("delivery")).toBe("online");
    expect(getPaymentMethod("ride")).toBe("cash");
    expect(getPaymentMethod("helper")).toBe("cash");
  });

  it("changes only the flow that was chosen", () => {
    usePaymentMethodStore.getState().setMethod("food", "cash");

    expect(getPaymentMethod("food")).toBe("cash");
    expect(getPaymentMethod("delivery")).toBe("online");
  });
});
