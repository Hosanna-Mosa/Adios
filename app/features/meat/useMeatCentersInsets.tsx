import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { createStyles } from "./meat-centers.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { QuickFilter } from "./useMeatCenters.shared";
import { getMeatCentresByUrl } from "@/services/catalog.service";

// Split out of useMeatCenters so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useMeatCentersInsets() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.meat;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [meatCenters, setMeatCenters] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const getCoords = async () => {
    if (selectedAddress) {
      const lat = selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1];
      const lng = selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0];
      if (lat != null && lng != null) return { lat, lng };
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return { lat: 17.4447, lng: 78.3498 };
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  };

  const fetchMeatCenters = async (lat: number, lng: number, pageNum: number = 1, category: string | null = null) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      let url = `/meat/nearby?lat=${lat}&lng=${lng}&page=${pageNum}&limit=20`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      // Rating and open-now are evaluated server-side, so paging keeps honouring
      // them instead of re-introducing centres the filter already removed.
      if (activeQuickFilters.has("rating")) url += "&minRating=4";
      if (activeQuickFilters.has("open")) url += "&openNow=true";

      const data = await getMeatCentresByUrl(url);

      if (Array.isArray(data)) {
        setHasMore(data.length >= 20);
        setMeatCenters((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      }
    } catch (error) {
      console.error("Error fetching meat centers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return { insets, tokens, accent, styles, loading, loadingMore, page, setPage, hasMore, setHasMore, meatCenters, selectedAddress, setSelectedAddress, selectedCategory, setSelectedCategory, activeQuickFilters, setActiveQuickFilters, searchOpen, setSearchOpen, searchText, setSearchText, getCoords, fetchMeatCenters };
}
