import Vendor from "../../database/models/Vendor";
import { ServiceType } from "../../database/models/Order";
import { OrdersService } from "../orders/orders.service";
import { CouponsService } from "../coupons/coupons.service";
import { resolveCatalog, verifyItems } from "../cart/cart.catalog";
import { PaymentError } from "./payment.checkout.service";
import { resolvePackageDelivery } from "../orders/orders.packageDelivery";

// The amount an online payment charges is decided here, never by the app
// (RAZORPAY_INTEGRATION.md §2 principle 1). The app only says WHAT is being bought; the
// returned orderData carries the server's own totals, so the order that is created after
// payment has exactly the price that was charged.

const MAX_TIP = 2000;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Item lines the checkout sends inside the drop stop(s). */
function collectItemLines(stops: any[]) {
  const lines: { stopIndex: number; lineIndex: number; line: any }[] = [];
  (stops || []).forEach((stop, stopIndex) => {
    if (!Array.isArray(stop?.items)) return;
    stop.items.forEach((line: any, lineIndex: number) => {
      if (line && (line.id || line._id || line.itemId)) lines.push({ stopIndex, lineIndex, line });
    });
  });
  return lines;
}

export class OnlinePriceService {
  private ordersService = new OrdersService();
  private couponsService = new CouponsService();

  /** Returns the amount to charge (rupees) and the orderData to store with the payment. */
  async quote(orderData: any): Promise<{ amount: number; orderData: any }> {
    if (!orderData || !Array.isArray(orderData.stops) || !orderData.stops.length) {
      throw new PaymentError(400, "ORDER_DATA_MISSING", "Order details are required to start a payment");
    }

    const serviceType = Object.values(ServiceType).includes(orderData.serviceType)
      ? orderData.serviceType
      : ServiceType.DELIVERY;
    const itemLines = collectItemLines(orderData.stops);
    const isMenuOrder = serviceType === ServiceType.DELIVERY && !!orderData.vendorId && itemLines.length > 0;

    if (isMenuOrder) return this.quoteMenuOrder(orderData, itemLines);

    // Bad package delivery details would only fail once the order is placed — after the money is taken.
    resolvePackageDelivery(serviceType, orderData.packageDelivery);

    // Rides, package delivery and helper tasks: the same price createOrder records. A
    // customerPrice is not accepted from an online checkout (it would set the fare).
    const { customerPrice: _ignored, ...rest } = orderData;
    const priced = await this.ordersService.priceOrder(
      rest.stops,
      serviceType,
      rest.vendorId,
      rest.totals,
      // duration: a helper task's booked hours, which its price depends on.
      { couponCode: rest.couponCode, scheduledDelivery: rest.scheduledDelivery, duration: rest.duration },
    );
    return { amount: round2(priced.totalPrice), orderData: rest };
  }

  /**
   * Food, meat and ₹149 store: every item re-priced from the outlet's live menu (the same
   * catalogue the cart sync uses), the vendor's own delivery fee, the coupon re-checked.
   */
  private async quoteMenuOrder(orderData: any, itemLines: ReturnType<typeof collectItemLines>) {
    const vendorId = String(orderData.vendorId);
    const catalog = await resolveCatalog(vendorId);

    const clientItems = itemLines.map(({ line }) => ({
      ...line,
      itemId: String(line.id ?? line._id ?? line.itemId),
      quantity: Math.max(1, Math.round(Number(line.quantity) || 1)),
    }));

    let pricedItems = clientItems;
    if (catalog) {
      const { items, changes } = verifyItems(clientItems, catalog);
      if (changes.length) {
        // A price moved, or an item sold out or was removed, since the customer saw the cart.
        const error = new PaymentError(
          409,
          "PRICES_CHANGED",
          "Some items in your cart have changed. Please review your cart and try again.",
        );
        (error as any).changes = changes;
        throw error;
      }
      pricedItems = items;
    } else {
      // Same rule as the cart sync: a menu that can't be resolved can't be verified.
      console.warn(`[payments] ALERT could not resolve the menu for vendor ${vendorId}; using cart prices`);
    }

    const subtotal = round2(pricedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
    const vendor = await Vendor.findById(vendorId).select("deliveryFee").lean().catch(() => null);
    const deliveryFee = Number((vendor as any)?.deliveryFee) || 0;
    const tip = Math.min(MAX_TIP, Math.max(0, Math.round(Number(orderData.totals?.tip) || 0)));

    const requestedCoupon = orderData.couponCode ?? orderData.totals?.couponCode;
    let discount = 0;
    let couponCode: string | undefined;
    if (requestedCoupon) {
      const { coupon, discountAmount } = await this.couponsService.resolveForCart(String(requestedCoupon), subtotal, vendorId);
      discount = Number(discountAmount) || 0;
      couponCode = coupon.code;
    }

    // Rounded the way createOrder rounds it, so the order total equals the amount charged.
    const raw = subtotal + deliveryFee + tip - discount;
    const total = Math.max(0, couponCode ? Math.round(raw) : round2(raw));

    // Put the verified prices back into the stops the order will be created from.
    const stops = orderData.stops.map((stop: any) => ({ ...stop, items: Array.isArray(stop?.items) ? [...stop.items] : stop?.items }));
    itemLines.forEach(({ stopIndex, lineIndex, line }, i) => {
      const price = Number(pricedItems[i].price);
      stops[stopIndex].items[lineIndex] = { ...line, price, quantity: pricedItems[i].quantity, total: round2(price * pricedItems[i].quantity) };
    });

    const { customerPrice: _ignored, ...rest } = orderData;
    return {
      amount: total,
      orderData: {
        ...rest,
        stops,
        totals: { subtotal, deliveryFee, tip, discount, total, couponCode },
      },
    };
  }
}
