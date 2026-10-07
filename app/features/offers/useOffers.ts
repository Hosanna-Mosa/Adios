import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { getOffers } from "@/services/catalog.service";
import type { Offer } from "@/types/models";
import { createOffersStyles } from "./offers.styles";
import { groupOffersByVendor } from "./offerFormat";

// State and data for app/offers.tsx: the active admin-managed offers from
// GET /offers, grouped by restaurant.

export const OFFERS_QUERY_KEY = ["offers"] as const;

export function useOffers() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.food;
  const styles = React.useMemo(() => createOffersStyles(tokens, accent), [tokens, accent]);

  const query = useQuery({
    queryKey: OFFERS_QUERY_KEY,
    queryFn: async () => {
      const res = await getOffers();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 60_000,
  });

  const groups = React.useMemo(() => groupOffersByVendor(query.data ?? []), [query.data]);

  // Same route and params as the home restaurant card (components/RestaurantListItem.tsx).
  const openVendor = React.useCallback((vendor: Offer["vendor"]) => {
    const categories = Array.isArray(vendor.categories) ? vendor.categories.join(", ") : "";
    router.push({
      pathname: "/restaurant-menu",
      params: {
        id: String(vendor._id),
        name: vendor.name,
        image: vendor.image || "",
        rating: vendor.rating != null ? String(vendor.rating) : "",
        reviews: vendor.reviews != null ? String(vendor.reviews) : "",
        isMeat: vendor.partnerType === "meat" ? "true" : "false",
        categories,
        minOrderValue: "",
        time: "",
        distance: "",
        address: vendor.address || "",
      },
    });
  }, []);

  return {
    insets,
    tokens,
    accent,
    styles,
    groups,
    isLoading: query.isLoading,
    isError: query.isError && !query.data,
    isRefreshing: query.isRefetching && !query.isLoading,
    refetch: query.refetch,
    openVendor,
    goBack: () => router.back(),
  };
}
