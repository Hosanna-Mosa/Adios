import { useEffect } from "react";
import { getOrders } from "@/services/orders.service";
import { getMeatMenu, getVendorMenu } from "@/services/catalog.service";

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
                images: item.images || [item.image || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400"],
                description: item.description || `Fresh ${item.name} - ${item.weight}`,
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
      .then((orders) => {
        const withVendor = (orders || []).filter((o) => o.vendor);
        const seen = new Set<string>();
        const deduped = withVendor.filter((o) => {
          // withVendor above has already dropped orders without a vendor, but
          // that narrowing does not survive the filter boundary, so assert here
          // rather than add a guard that would change which rows are kept.
          const vId = (typeof o.vendor === "object" ? o.vendor!._id : o.vendor) as string;
          if (seen.has(vId)) return false;
          seen.add(vId);
          return true;
        });
        setRecentOrders(deduped.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [items.length]);

  return {  };
}
