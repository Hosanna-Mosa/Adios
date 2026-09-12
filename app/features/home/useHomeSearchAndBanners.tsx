import { useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHomeStore } from "@/contexts/homeStore";
import { TAG_SEARCH_MAP } from "./useHome.shared";
import { getBanners, searchDishes } from "@/services/catalog.service";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeSearchAndBanners(searchQuery: any, banners: any, setBanners: any, hasShownStartupAd: any, setHasShownStartupAd: any, setActiveStartupAd: any, setSelectedAddress: any, setIsAddressLoaded: any, setSearchedDishes: any, setIsSearchingDishes: any) {
  useEffect(() => {
    if (!searchQuery) {
      setSearchedDishes([]);
      setIsSearchingDishes(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsSearchingDishes(true);
        // Keep the tag itself alongside its synonym. Replacing "Desserts" with
        // "Waffles" searched for a word the catalogue does not contain.
        const synonym = TAG_SEARCH_MAP[searchQuery];
        const queryTerm = synonym && synonym.toLowerCase() !== searchQuery.toLowerCase()
          ? `${searchQuery} ${synonym}`
          : searchQuery;
        const coords = useHomeStore.getState().lastFetchedCoords;
        const coordParams = coords ? `&lat=${coords.lat}&lng=${coords.lng}` : "";
        const data = await searchDishes(queryTerm, coordParams);
        if (!cancelled) setSearchedDishes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error searching dishes:", error);
        if (!cancelled) setSearchedDishes([]);
      } finally {
        if (!cancelled) setIsSearchingDishes(false);
      }
    })();
    return () => { cancelled = true; };
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const activeStr = await AsyncStorage.getItem("active_address");
          if (activeStr) setSelectedAddress(JSON.parse(activeStr));
        } catch (e) {
          console.error("Failed to load active address:", e);
        } finally {
          setIsAddressLoaded(true);
        }
      })();

      (async () => {
        try {
          const response = await getBanners<any>();
          if (response && response.data) {
            setBanners(response.data);
            const startupAds = response.data.filter((b: any) => b.itemType === "ad" && b.position === "startup");
            if (startupAds.length > 0 && !hasShownStartupAd) {
              setActiveStartupAd(startupAds[0]);
              setHasShownStartupAd(true);
            }
          }
        } catch (e) {
          console.error("Failed to load banners:", e);
        }
      })();
    }, [])
  );

  return {  };
}
