import { useEffect } from "react";
import { getOrders } from "@/services/orders.service";
import { getMeatMenu, getVendor, getVendorMenu } from "@/services/catalog.service";

// Split out of useCart so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useCartMenuAndRecentOrders(items: any, vendorId: any, setMenuItems: any, setRecentOrders: any, setLoadingRecent: any) {
  useEffect(() => {
    if (!vendorId) return;
    getVendorMenu(vendorId)
      .then((data) => {
        if (data?.length) setMenuItems(data);
        else fetchMeatMenu();
      })
      .catch(fetchMeatMenu);

    function fetchMeatMenu() {
      getMeatMenu(vendorId)
        .then((meatData) => {
          if (Array.isArray(meatData)) {
            setMenuItems(
              meatData.map((item: any) => ({
                ...item,
                isVeg: false,
                images: item.images || (item.image ? [item.image] : []),
                description: item.description || (item.weight ? String(item.weight) : ""),
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [vendorId]);

  // Empty-cart "order again" — real order history, best-effort vendor name.
  useEffect(() => {
    if (items.length > 0) return;
    setLoadingRecent(true);
    getOrders()
      .then(async (orders) => {
        const withVendor = (orders || []).filter((o) => o.vendor);
        const seen = new Set<string>();
        const deduped = withVendor
          .filter((o) => {
            // withVendor above has already dropped orders without a vendor, but
            // that narrowing does not survive the filter boundary, so assert here
            // rather than add a guard that would change which rows are kept.
            const vId = (typeof o.vendor === "object" ? o.vendor!._id : o.vendor) as string;
            if (seen.has(vId)) return false;
            seen.add(vId);
            return true;
          })
          .slice(0, 3);

        // GET /orders doesn't populate vendor (documented in useOrders.shared's
        // resolveServiceKey) — it's a bare id, so these cards had no photo to show,
        // just an empty placeholder box. At most 3 cards ever show here, so a
        // handful of public, unauthenticated vendor lookups fills in the real
        // photo (and name) cheaply.
        const withVendorInfo = await Promise.all(
          deduped.map(async (o) => {
            if (typeof o.vendor === "object" && o.vendor?.image) return o;
            const vId = (typeof o.vendor === "object" ? o.vendor!._id : o.vendor) as string;
            try {
              const vendor = await getVendor<{ name?: string; image?: string }>(vId);
              return { ...o, vendor: { _id: vId, name: vendor?.name, image: vendor?.image } };
            } catch {
              return o;
            }
          })
        );
        setRecentOrders(withVendorInfo);
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [items.length]);

  return {  };
}
