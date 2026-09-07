import Cart, { ICartItem } from "../../database/models/Cart";
import { CartChange, resolveCatalog, verifyItems } from "./cart.catalog";

export interface CartPayload {
  vendorId: string | null;
  items: any[];
  /** What reconciliation against the live menu had to correct. Empty when nothing moved. */
  changes: CartChange[];
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

  /**
   * Reconciles `items` against the outlet's live menu. Returns the stored rows
   * untouched when the catalogue can't be resolved — see resolveCatalog.
   */
  private async verifyAgainstCatalog(vendorId: string | null, items: any[]) {
    if (!vendorId || !items.length) return { items, changes: [] as CartChange[] };
    const catalog = await resolveCatalog(String(vendorId));
    return verifyItems(items, catalog);
  }

  async getCart(userId: string): Promise<CartPayload> {
    const cart = await Cart.findOne({ user: userId }).lean();
    const vendorId = cart?.vendor ?? null;
    const stored = (cart?.items ?? []).map((item) => this.toWireItem(item));

    const { items, changes } = await this.verifyAgainstCatalog(vendorId, stored);

    // Write the correction back, so a stale price is fixed once rather than
    // re-reported on every fetch — and so checkout reads the corrected cart.
    if (changes.length) {
      if (!items.length) {
        await this.clearCart(userId);
        return { vendorId: null, items: [], changes };
      }
      await Cart.updateOne(
        { user: userId },
        { $set: { items: items.map((item) => this.normalizeItem(item)) } },
      );
    }

    return { vendorId, items: items.map((item) => this.toWireItem(item)), changes };
  }

  /**
   * Whole-cart replace, never a merge — the result is independent of request ordering.
   * The incoming prices are treated as a client claim and re-checked against the
   * menu before they are stored.
   */
  async saveCart(userId: string, vendorId: string | null, items: any[]): Promise<CartPayload> {
    const normalized = (items || []).map((item) => this.normalizeItem(item)).filter((item) => !!item.itemId);

    if (!normalized.length) {
      await this.clearCart(userId);
      return { vendorId: null, items: [], changes: [] };
    }

    const { items: verified, changes } = await this.verifyAgainstCatalog(vendorId, normalized);

    if (!verified.length) {
      await this.clearCart(userId);
      return { vendorId: null, items: [], changes };
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { vendor: vendorId ?? null, items: verified.map((item) => this.normalizeItem(item)) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return {
      vendorId: cart?.vendor ?? null,
      items: (cart?.items ?? []).map((item) => this.toWireItem(item)),
      changes,
    };
  }

  async clearCart(userId: string): Promise<void> {
    await Cart.deleteOne({ user: userId });
  }
}
