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
      .then(async (orders) => {
        const withVendor = (orders || []).filter((o) => o.vendor);
        const seen = new Set<string>();
        const deduped = withVendor
          .filter((o) => {
            const vId = typeof o.vendor === "object" ? o.vendor._id : o.vendor;
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
            const vId = typeof o.vendor === "object" ? o.vendor._id : o.vendor;
            try {
              const vendor = await customFetch<{ name?: string; image?: string }>(`/vendors/${vId}`);
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
