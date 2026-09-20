import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";

// Resolves the /restaurant-menu/<vendorId> path a shared link uses (see
// utils/shareLink.ts) into the params app/restaurant-menu.tsx expects — that
// screen reads ?id=&name=&image= from the query, so the deep link had nothing to
// render with and landed on +not-found.

export function useRestaurantMenuLink() {
  const { id, item } = useLocalSearchParams<{ id: string; item?: string }>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) {
      setFailed(true);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const vendor = await customFetch<any>(`/vendors/${id}`);
        if (cancelled) return;
        if (!vendor?._id) {
          setFailed(true);
          return;
        }
        router.replace({
          pathname: "/restaurant-menu",
          params: {
            id: String(vendor._id),
            name: vendor.name || "",
            image: vendor.image || vendor.images?.[0] || "",
            rating: vendor.rating != null ? String(vendor.rating) : "",
            reviews: vendor.reviews || "",
            isMeat: "false",
            categories: Array.isArray(vendor.categories) ? vendor.categories.join(", ") : "",
            address: vendor.address || "",
            ...(item ? { highlightDishId: String(item) } : {}),
          },
        });
      } catch (error) {
        console.error("[deepLink] Couldn't resolve shared restaurant:", error);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, item]);

  const goHome = () => router.replace("/(tabs)");

  return { failed, goHome };
}
