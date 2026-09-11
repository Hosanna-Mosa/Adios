import { useEffect } from "react";
import { customFetch } from "@/utils/api/custom-fetch";

// Part 2 of useCart, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useCartPart2(items: any, vendorId: any, setMenuItems: any, setRecentOrders: any, setLoadingRecent: any) {
  useEffect(() => {
    if (!vendorId) return;
    customFetch<any[]>(`/food/vendor/${vendorId}`)
      .then((data) => {
        if (data?.length) setMenuItems(data);
        else fetchMeatMenu();
      })
      .catch(fetchMeatMenu);

    function fetchMeatMenu() {
      customFetch<any[]>(`/meat/menu/${vendorId}`)
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
    customFetch<any[]>("/orders")
      .then((orders) => {
        const withVendor = (orders || []).filter((o) => o.vendor);
        const seen = new Set<string>();
        const deduped = withVendor.filter((o) => {
          const vId = typeof o.vendor === "object" ? o.vendor._id : o.vendor;
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
