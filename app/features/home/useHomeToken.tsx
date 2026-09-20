import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/contexts/authStore";

// Part 4 of useHome, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHomeToken(searchText: any, setSearchQuery: any) {
  const token = useAuthStore((s) => s.token);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressLoaded, setIsAddressLoaded] = useState(false);
  const [hasNoLocation, setHasNoLocation] = useState(false);
  const addressResolveRef = useRef<(() => void) | null>(null);
  const hasRedirectedRef = useRef(false);

  const [isDistanceSheetOpen, setIsDistanceSheetOpen] = useState(false);
  const [distanceOption, setDistanceOption] = useState<"1" | "3" | "5" | "10" | "custom">("5");
  const [customDistance, setCustomDistance] = useState("");
  const [appliedDistanceKm, setAppliedDistanceKm] = useState<number | null>(null);
  const [distanceRefreshKey, setDistanceRefreshKey] = useState(0);

  const [searchedDishes, setSearchedDishes] = useState<any[]>([]);
  const [isSearchingDishes, setIsSearchingDishes] = useState(false);

  const [loading149, setLoading149] = useState(false);

  // Filter state
  const [selectedSort, setSelectedSort] = useState<string>("relevance");
  const [filter99Store, setFilter99Store] = useState<boolean>(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState<boolean>(false);
  const [filterOffers, setFilterOffers] = useState<boolean>(false);
  const [filterMinRating, setFilterMinRating] = useState<number>(0); // 0 = no threshold
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filterCostRange, setFilterCostRange] = useState<string>("all");
  const [filterVegNonVeg, setFilterVegNonVeg] = useState<string>("all");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<string>("Sort");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  // One debounce feeds both halves of search — the dish list and the restaurant
  // refetch — so the two can never be answering different questions.
  useEffect(() => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      setSearchQuery("");
      return;
    }
    const delayDebounceFn = setTimeout(() => setSearchQuery(trimmed), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  return { token, selectedAddress, setSelectedAddress, isAddressLoaded, setIsAddressLoaded, hasNoLocation, setHasNoLocation, addressResolveRef, hasRedirectedRef, isDistanceSheetOpen, setIsDistanceSheetOpen, distanceOption, setDistanceOption, customDistance, setCustomDistance, appliedDistanceKm, setAppliedDistanceKm, distanceRefreshKey, setDistanceRefreshKey, searchedDishes, setSearchedDishes, isSearchingDishes, setIsSearchingDishes, setLoading149, selectedSort, setSelectedSort, filter99Store, setFilter99Store, filterFastDelivery, setFilterFastDelivery, filterOffers, setFilterOffers, filterMinRating, setFilterMinRating, filterOpenNow, setFilterOpenNow, filterCostRange, setFilterCostRange, filterVegNonVeg, setFilterVegNonVeg, selectedCuisines, setSelectedCuisines, activeFilterTab, setActiveFilterTab, isFilterModalVisible, setIsFilterModalVisible };
}
