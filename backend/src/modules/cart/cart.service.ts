import Cart, { ICartItem } from "../../database/models/Cart";

export interface CartPayload {
  vendorId: string | null;
  items: any[];
}

export class CartService {
  /**
   * Accepts either `itemId` or `_id` as the item key and stores the canonical `itemId`.
   */
  private normalizeItem(item: any): ICartItem {
    const { _id, itemId, ...rest } = item || {};
    return {
      ...rest,
      itemId: String(itemId || _id || ""),
      name: String(item?.name ?? ""),
      price: Number(item?.price) || 0,
      quantity: Math.max(1, Math.round(Number(item?.quantity) || 1)),
    };
  }

  /**
   * Echoes both keys back so a client that reads `_id` and one that reads `itemId` both work.
   */
  private toWireItem(item: any): any {
    const plain = typeof item?.toObject === "function" ? item.toObject() : { ...item };
    return { ...plain, itemId: plain.itemId, _id: plain.itemId };
  }

  async getCart(userId: string): Promise<CartPayload> {
    const cart = await Cart.findOne({ user: userId }).lean();
    return {
      vendorId: cart?.vendor ?? null,
      items: (cart?.items ?? []).map((item) => this.toWireItem(item)),
    };
  }

  /**
   * Whole-cart replace, never a merge — the result is independent of request ordering.
   */
  async saveCart(userId: string, vendorId: string | null, items: any[]): Promise<CartPayload> {
    const normalized = (items || []).map((item) => this.normalizeItem(item)).filter((item) => !!item.itemId);

    if (!normalized.length) {
      await this.clearCart(userId);
      return { vendorId: null, items: [] };
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { vendor: vendorId ?? null, items: normalized } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return {
      vendorId: cart?.vendor ?? null,
      items: (cart?.items ?? []).map((item) => this.toWireItem(item)),
    };
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.deleteOne({ user: userId });
  }
}
