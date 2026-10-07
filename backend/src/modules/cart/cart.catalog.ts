import mongoose from "mongoose";
import FoodItem from "../../database/models/FoodItem";
import MeatItem from "../../database/models/MeatItem";
import DigitalMenuItem from "../../database/models/DigitalMenuItem";
import Vendor from "../../database/models/Vendor";
import { buildOnboardedFoodItems } from "../food/food.controller";
import { buildOnboardedMeatItems } from "../meat/meat.controller";

/**
 * A cart stores a *snapshot* of each item (name, price, image) taken when it was
 * added, so nothing here re-reads the catalogue on its own. These helpers rebuild
 * the outlet's live menu and reconcile the snapshot against it, which is what
 * stops a renamed dish or an edited price from living on in carts forever.
 */

export type CartChangeStatus = "price_changed" | "unavailable" | "removed";

export interface CartChange {
  itemId: string;
  name: string;
  status: CartChangeStatus;
  /** Only on `price_changed`. */
  previousPrice?: number;
  price?: number;
}

interface CatalogEntry {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable: boolean;
}

const imagesOf = (row: any): string[] => {
  if (Array.isArray(row?.images) && row.images.length) {
    return row.images.filter((url: unknown) => typeof url === "string");
  }
  return row?.image ? [String(row.image)] : [];
};

/**
 * Every place a cart line can legitimately come from, keyed by the id the app
 * stores. Deliberately mirrors what getVendorMenu / getMeatCenterMenu serve:
 *
 *  - FoodItem       vendor-portal and seeded restaurant menus (also the "legacy"
 *                   food rows a meat centre can own — same query covers both)
 *  - MeatItem       meat-centre menus
 *  - DigitalMenuItem  restaurants added via the digital-menu flow
 *  - vendor.operations  onboarding-captured menus, which are NOT documents at all;
 *                   they are rebuilt on the fly with composite ids like
 *                   `<vendorId>-<category>-<index>`. Looking those up by
 *                   findById would miss every one of them.
 *
 * Returns `null` when nothing could be resolved — a deleted outlet, an id from a
 * source not listed above, or a failed query. Callers must treat `null` as
 * "cannot verify" and leave the cart untouched; blanking a cart because a lookup
 * came back empty would be far worse than serving a stale price.
 */
export async function resolveCatalog(vendorId: string): Promise<Map<string, CatalogEntry> | null> {
  if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) return null;

  let foodDocs: any[] = [];
  let meatDocs: any[] = [];
  let digitalDocs: any[] = [];
  let vendor: any = null;

  try {
    [foodDocs, meatDocs, digitalDocs, vendor] = await Promise.all([
      FoodItem.find({ vendorId }).lean(),
      MeatItem.find({ meatCenterId: vendorId }).lean(),
      DigitalMenuItem.find({ restaurantId: vendorId }).lean(),
      Vendor.findById(vendorId).lean(),
    ]);
  } catch {
    return null;
  }

  const catalog = new Map<string, CatalogEntry>();
  const add = (row: any) => {
    const id = String(row?._id ?? "");
    if (!id || catalog.has(id)) return;
    // A dish on offer is charged its offer price, the same one the menu shows.
    const listPrice = Number(row?.price) || 0;
    const offerPrice = Number(row?.offerPrice);
    const hasOffer = row?.offerPrice != null && offerPrice > 0 && offerPrice < listPrice;
    catalog.set(id, {
      name: String(row?.name ?? ""),
      description: String(row?.description ?? ""),
      price: hasOffer ? offerPrice : listPrice,
      category: String(row?.category ?? ""),
      isVeg: row?.isVeg === true,
      images: imagesOf(row),
      isAvailable: row?.isAvailable !== false,
    });
  };

  foodDocs.forEach(add);
  meatDocs.forEach(add);
  digitalDocs.forEach(add);
  if (vendor) {
    const onboarded =
      vendor.partnerType === "meat" ? buildOnboardedMeatItems(vendor) : buildOnboardedFoodItems(vendor);
    onboarded.forEach(add);
  }

  return catalog.size ? catalog : null;
}

/**
 * Reconciles stored cart lines against the live menu. Priced-up lines are
 * corrected in place; sold-out and deleted lines are dropped. Every difference is
 * reported in `changes` so the client can tell the customer what moved rather
 * than silently swapping the total under them.
 */
export function verifyItems(
  items: any[],
  catalog: Map<string, CatalogEntry> | null,
): { items: any[]; changes: CartChange[] } {
  if (!catalog) return { items, changes: [] };

  const verified: any[] = [];
  const changes: CartChange[] = [];

  for (const item of items ?? []) {
    const itemId = String(item?.itemId ?? item?._id ?? "");
    const entry = catalog.get(itemId);

    if (!entry) {
      changes.push({ itemId, name: String(item?.name ?? ""), status: "removed" });
      continue;
    }

    if (!entry.isAvailable) {
      changes.push({ itemId, name: entry.name || String(item?.name ?? ""), status: "unavailable" });
      continue;
    }

    const previousPrice = Number(item?.price) || 0;
    if (entry.price !== previousPrice) {
      changes.push({
        itemId,
        name: entry.name || String(item?.name ?? ""),
        status: "price_changed",
        previousPrice,
        price: entry.price,
      });
    }

    verified.push({
      ...item,
      name: entry.name || item?.name,
      description: entry.description || item?.description || "",
      price: entry.price,
      category: entry.category || item?.category || "",
      isVeg: entry.isVeg,
      images: entry.images.length ? entry.images : imagesOf(item),
    });
  }

  return { items: verified, changes };
}
