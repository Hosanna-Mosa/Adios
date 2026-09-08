import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, Platform, Text, View, ActivityIndicator } from "react-native";

import { FlashList } from "@shopify/flash-list";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StickyHeader } from "@/features/home/components/StickyHeader";
import { EmptySearchState } from "@/features/home/components/EmptySearchState";
import { NoRidersState } from "@/features/home/components/NoRidersState";
import { DistanceSheet } from "@/features/home/components/DistanceSheet";

import { HomeSearchOverlay } from "@/features/home/components/HomeSearchOverlay";
import { HomeFilterModal } from "@/features/home/components/HomeFilterModal";

import { STRIDE } from "@/features/home/constants";
import { createStyles } from "@/features/home/home.styles";
import { DishSearchResultItem } from "@/features/home/components/DishSearchResultItem";
import { HomeSkeletonCard } from "@/features/home/components/HomeSkeletonCard";
import { designTokens } from "@/constants/colors";

import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useHomeStore } from "@/contexts/homeStore";
import { RestaurantListItem } from "@/components/RestaurantListItem";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";
import { useAuthStore } from "@/contexts/authStore";
import { useCartStore } from "@/contexts/cartStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { SPRING, staggerListItem } from "@/motion/presets";

import { HomeNoServiceContainer } from "@/features/home/components/HomeNoServiceContainer";
import { HomeNoServiceContainer2 } from "@/features/home/components/HomeNoServiceContainer2";
import { HomeNoServiceContainer3 } from "@/features/home/components/HomeNoServiceContainer3";
import { HomeEmptySearchContainer } from "@/features/home/components/HomeEmptySearchContainer";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { StartupAdModal } from "@/features/home/components/StartupAdModal";
import { HomeBody } from "@/features/home/components/HomeBody";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<any>);

// Maps the short quick-search tags to the actual query terms the backend
// dish-search endpoint expects.
const TAG_SEARCH_MAP: { [key: string]: string } = {
  "Biryani": "Biryani",
  "Dosa": "Dosa",
  "Idly": "Idli",
  "Fried Rice": "Rice",
  "Fast Food": "Burger",
  "Breakfast": "Breakfast",
  "Healthy": "Salad",
  "Deals": "Thali",
  "Burgers": "Burger",
  "Smoothie": "Lassi",
  "Pizza": "Pizza",
  "Desserts": "Waffles",
  "Tea & Coffee": "Coffee",
  "Noodles": "Noodles",
  "Chicken": "Chicken",
  "Paneer": "Paneer",
  "Fish": "Fish",
};

const HOME_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({ _id: `home-skeleton-${index}` }));

const DEFAULT_CUISINES = ["Biryani", "Tiffins", "Chinese", "Pizza", "Sweets"];
const DEFAULT_MEAT_TYPES = ["Chicken", "Mutton", "Seafood", "Eggs"];

const FOOD_PROMOS = [
  { eyebrow: "First order", headline: "50% off up to ₹120", caption: "Code FLAV50 · min ₹199" },
  { eyebrow: "Late night", headline: "Open till 2 AM", caption: "42 outlets near you" },
];
const MEAT_PROMOS = [
  { eyebrow: "Sunday special", headline: "Country chicken ₹399 / kg", caption: "" },
  { eyebrow: "Cleaned & cut", headline: "No fee today", caption: "" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const {
    restaurants,
    setRestaurants,
    meatCenters,
    setMeatCenters,
    nearbyDriversCount,
    setNearbyDriversCount,
    loading,
    setLoading,
    loadingDrivers,
    setLoadingDrivers,
    store149Items,
    setStore149Items,
    activeService,
    setActiveService,
  } = useHomeStore();

  const [searchText, setSearchText] = useState("");
  // Debounced copy of searchText — the term actually sent to the server.
  const [searchQuery, setSearchQuery] = useState("");
  // The term the currently loaded restaurant list was fetched with.
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchTranslateY = useSharedValue(-Dimensions.get("window").height);
  const searchBackdropOpacity = useSharedValue(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isSearchActive) {
      setIsSearchVisible(true);
      // Entry animation is handled by onShow in Modal
    } else if (isSearchVisible) {
      searchTranslateY.value = withTiming(-Dimensions.get("window").height, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      searchBackdropOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(setIsSearchVisible)(false);
      });
    }
  }, [isSearchActive]);

  const searchSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: searchTranslateY.value }],
  }));
  const searchBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchBackdropOpacity.value,
  }));

  const [banners, setBanners] = useState<any[]>([]);
  const [hasShownStartupAd, setHasShownStartupAd] = useState(false);
  const [activeStartupAd, setActiveStartupAd] = useState<any | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const carouselRef = useAnimatedRef<Animated.ScrollView>();
  const bannerScrollX = useSharedValue(0);
  const bannerIndexRef = useRef(0);
  const onBannerScroll = useAnimatedScrollHandler((event) => {
    bannerScrollX.value = event.contentOffset.x;
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("recent_searches");
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    })();
  }, []);

  const addRecentSearch = async (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    const newRecent = [trimmed, ...recentSearches.filter((q) => q !== trimmed)].slice(0, 5);
    setRecentSearches(newRecent);
    try {
      await AsyncStorage.setItem("recent_searches", JSON.stringify(newRecent));
    } catch (e) {
      console.error("Failed to save recent searches", e);
    }
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem("recent_searches");
  };

  const [loadingMore, setLoadingMore] = useState(false);
  const [isRetryingDrivers, setIsRetryingDrivers] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services[activeService === "Meat" ? "meat" : "food"];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, activeService]);

  const cartVendorId = useCartStore((s) => s.vendorId);
  const cartVendorName = useMemo(() => {
    if (!cartVendorId) return undefined;
    const list = activeService === "Meat" ? meatCenters : restaurants;
    return list.find((v) => v._id === cartVendorId)?.name;
  }, [cartVendorId, meatCenters, restaurants, activeService]);

  const isHoveringSearch = useCartStore((s) => s.isHoveringSearch);
  const searchBarScale = useSharedValue(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    searchBarScale.value = withSpring(isHoveringSearch ? 1.06 : 1.0, SPRING);
  }, [isHoveringSearch]);

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        const data = await customFetch<any>(`/food/search?query=${encodeURIComponent(queryTerm)}${coordParams}`);
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
          const response = await customFetch<any>("/banners");
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

  const getCoords = async () => {
    if (selectedAddress) {
      const lat = selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1];
      const lng = selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0];
      if (lat != null && lng != null) {
        useDeliveryStore.getState().setCurrentCoords({ lat, lng });
        if (selectedAddress.addressLine) {
          useDeliveryStore.getState().setCurrentLocation(selectedAddress.addressLine);
        } else if (selectedAddress.label) {
          useDeliveryStore.getState().setCurrentLocation(selectedAddress.label);
        }
        return { lat, lng };
      }
    }

    try {
      const gpsDeniedBefore = await AsyncStorage.getItem("gps_permission_denied");
      if (gpsDeniedBefore !== "true") {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === "undetermined") {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          status = newStatus;
        }

        if (status === "granted") {
          let loc = null;
          try {
            const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const timeoutPromise = new Promise<any>((_, reject) =>
              setTimeout(() => reject(new Error("Location fetch timeout")), 8000)
            );
            loc = await Promise.race([locPromise, timeoutPromise]);
          } catch (e) {
            console.warn("Home Screen: High accuracy location failed/timed out, trying last known...", e);
            loc = await Location.getLastKnownPositionAsync();
          }

          if (!loc) {
            console.warn("Home Screen: Could not get any location");
            return { lat: null, lng: null };
          }

          const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          useDeliveryStore.getState().setCurrentCoords(coords);

          try {
            const [address] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
            if (address) {
              const formatted = [
                address.name, address.street, address.district || address.subregion,
                address.city, address.region, address.postalCode,
              ].filter(Boolean).join(", ");
              useDeliveryStore.getState().setCurrentLocation(formatted);
            }
          } catch (e) {
            console.warn("Home Screen: Reverse geocoding failed:", e);
          }

          return coords;
        } else {
          await AsyncStorage.setItem("gps_permission_denied", "true");
        }
      }
    } catch (error) {
      console.warn("Home Screen: GPS fetch failed:", error);
    }

    return { lat: null, lng: null };
  };

  const selectedDistanceKm = distanceOption === "custom"
    ? Math.max(1, Number(customDistance) || 5)
    : Number(distanceOption);

  // Radius, rating threshold, open-now and the nearest-first ordering are all
  // resolved server-side, so page 2 and beyond keep honouring them instead of
  // re-introducing outlets the filter already removed.
  const discoveryParams = useMemo(() => {
    const parts: string[] = [];
    if (appliedDistanceKm) parts.push(`&radius=${Math.round(appliedDistanceKm * 1000)}`);
    if (filterMinRating > 0) parts.push(`&minRating=${filterMinRating}`);
    if (filterOpenNow) parts.push("&openNow=true");
    if (selectedSort === "distance") parts.push("&sort=distance");
    else if (selectedSort === "rating") parts.push("&sort=rating");
    return parts.join("");
  }, [appliedDistanceKm, filterMinRating, filterOpenNow, selectedSort]);

  // Everything in discoveryParams except the radius, which already has its own
  // refetch path through applyDistanceFilter.
  const serverFilterKey = useMemo(
    () => [filterMinRating, filterOpenNow, selectedSort === "distance" || selectedSort === "rating" ? selectedSort : "default", searchQuery].join("|"),
    [filterMinRating, filterOpenNow, selectedSort, searchQuery]
  );

  const fetchVendors = async (lat: number, lng: number, pageNum: number = 1) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      // The server matches a restaurant through its menu items too, which is the
      // only way a dish word like "Dosa" can surface the outlets that serve it.
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const data = await customFetch<any>(`/vendors/nearby?lat=${lat}&lng=${lng}&page=${pageNum}&limit=20${discoveryParams}${searchParam}`);
      setAppliedSearchTerm(searchQuery);
      if (Array.isArray(data)) {
        if (data.length < 20) setHasMore(false); else setHasMore(true);
        if (pageNum === 1) {
          setRestaurants(data);
        } else {
          setRestaurants((prev) => {
            const newItems = data.filter((d) => !prev.some((p) => p._id === d._id));
            return [...prev, ...newItems];
          });
        }
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchMeatCenters = async (lat: number, lng: number, pageNum: number = 1) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      const data = await customFetch<any>(`/meat/nearby?lat=${lat}&lng=${lng}&page=${pageNum}&limit=20${discoveryParams}`);
      if (Array.isArray(data)) {
        if (data.length < 20) setHasMore(false); else setHasMore(true);
        if (pageNum === 1) {
          setMeatCenters(data);
        } else {
          setMeatCenters((prev) => {
            const newItems = data.filter((d) => !prev.some((p) => p._id === d._id));
            return [...prev, ...newItems];
          });
        }
      }
    } catch (error) {
      console.error("Error fetching meat centers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetch149StoreItems = async (lat: number, lng: number) => {
    try {
      setLoading149(true);
      const data = await customFetch<any>(`/food/store-149?lat=${lat}&lng=${lng}`);
      setStore149Items(data);
    } catch (error) {
      console.error("Error fetching 149 store items:", error);
    } finally {
      setLoading149(false);
    }
  };

  // `silent` skips the global loadingDrivers flag — that flag drives the
  // full-screen skeleton, so flipping it for a button-level retry replaced
  // the empty state with a flash of skeleton cards instead of just updating
  // the button. The "Retry search" action passes silent:true and shows its
  // own inline spinner via isRetryingDrivers instead.
  const checkNearbyDrivers = async (lat: number, lng: number, opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoadingDrivers(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${baseUrl}/drivers/nearby?latitude=${lat}&longitude=${lng}&radius=5000`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) setNearbyDriversCount(data.length);
      }
    } catch (error) {
      console.error("Error checking nearby drivers:", error);
    } finally {
      if (!opts?.silent) setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    if (!isAddressLoaded) return;

    (async () => {
      const { lat, lng } = await getCoords();
      if (lat && lng) {
        setHasNoLocation(false);
        const storeState = useHomeStore.getState();
        if (
          storeState.lastFetchedCoords &&
          storeState.lastFetchedCoords.lat === lat &&
          storeState.lastFetchedCoords.lng === lng &&
          storeState.lastFetchedService === activeService
        ) {
          if (addressResolveRef.current) {
            addressResolveRef.current();
            addressResolveRef.current = null;
          }
          return;
        }

        setPage(1);
        setHasMore(true);
        setLoading(true);
        setLoadingDrivers(true);
        try {
          const fetchPromise = Promise.all([
            checkNearbyDrivers(lat, lng),
            activeService === "Meat"
              ? fetchMeatCenters(lat, lng, 1)
              : Promise.all([fetchVendors(lat, lng, 1), fetch149StoreItems(lat, lng)]),
          ]);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout after 15 seconds")), 15000);
          });
          await Promise.race([fetchPromise, timeoutPromise]);
        } catch (e) {
          console.warn("Home Screen: Initial fetches timed out or failed (likely slow dev server):", e);
        } finally {
          setLoading(false);
          setLoadingDrivers(false);
        }

        useHomeStore.setState({ lastFetchedCoords: { lat, lng }, lastFetchedService: activeService });
      } else {
        setHasNoLocation(true);
        setPage(1);
        setHasMore(true);
        setLoading(false);
        setLoadingDrivers(false);

        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.push("/delivery/saved-addresses");
        }
      }

      if (addressResolveRef.current) {
        addressResolveRef.current();
        addressResolveRef.current = null;
      }
    })();
  }, [isAddressLoaded, selectedAddress, activeService, appliedDistanceKm, distanceRefreshKey]);

  const loadMore = async () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      const { lat, lng } = await getCoords();
      if (lat && lng) {
        if (activeService === "Meat") fetchMeatCenters(lat, lng, nextPage);
        else fetchVendors(lat, lng, nextPage);
      }
    }
  };

  const handleServiceSwitch = (service: "Food" | "Meat") => {
    if (activeService === service) return;
    setPage(1);
    setHasMore(true);
    setActiveService(service);
  };

  const applyDistanceFilter = () => {
    setIsDistanceSheetOpen(false);
    useHomeStore.setState({ lastFetchedCoords: null });
    setLoading(true);
    setAppliedDistanceKm(selectedDistanceKm);
    setDistanceRefreshKey((value) => value + 1);
  };

  // Rating, open-now, ordering and search are server-side now, so each change needs
  // a fresh page 1. The main fetch effect early-returns on its cached-coords guard,
  // so drop that cache first — the same nudge applyDistanceFilter uses.
  const didMountFiltersRef = useRef(false);
  useEffect(() => {
    if (!didMountFiltersRef.current) {
      didMountFiltersRef.current = true;
      return;
    }
    useHomeStore.setState({ lastFetchedCoords: null });
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setDistanceRefreshKey((value) => value + 1);
  }, [serverFilterKey]);

  const clearDistanceFilter = () => {
    setDistanceOption("5");
    setCustomDistance("");
    setAppliedDistanceKm(null);
    useHomeStore.setState({ lastFetchedCoords: null });
    setLoading(true);
    setDistanceRefreshKey((value) => value + 1);
    setIsDistanceSheetOpen(false);
  };

  const showHomeSkeleton = (loading && !loadingMore) || loadingDrivers;

  // Every restaurant that serves one of the matched dishes, so a dish word also
  // surfaces its outlet even when the outlet's own text says nothing about it.
  const dishVendorIds = useMemo(
    () =>
      new Set(
        searchedDishes
          .map((dish: any) => (dish?.vendorId && typeof dish.vendorId === "object" ? dish.vendorId._id : dish?.vendorId))
          .filter(Boolean)
          .map(String)
      ),
    [searchedDishes]
  );

  // For Food the server already matched restaurants through their menus, so a
  // second name-only pass here would throw those hits away. /meat/nearby has no
  // search parameter, so meat keeps the local match, widened by the dish hits.
  const isServerSearched = activeService !== "Meat" && !!searchQuery && appliedSearchTerm === searchQuery;

  const filteredItems = useMemo(() => {
    return (activeService === "Meat" ? meatCenters : restaurants).filter((item) => {
      if (!searchText) return true;
      if (isServerSearched) return true;
      const query = searchText.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(query);
      const categoryMatch = item.categories && item.categories.some((cat: string) => cat.toLowerCase().includes(query));
      const addressMatch = item.address && item.address.toLowerCase().includes(query);
      return nameMatch || categoryMatch || addressMatch || dishVendorIds.has(String(item._id));
    });
  }, [activeService, meatCenters, restaurants, searchText, isServerSearched, dishVendorIds]);

  // Note: the old code had a second, overlapping veg-only filter on top of
  // this (a header toggle separate from the "Pure Veg" filter chip below).
  // The mockup has one veg control, not two — filterVegNonVeg (driven by the
  // "Veg only" switch and the "Pure Veg" chip, same state) now does this job.
  const visibleItems = filteredItems;

  const filteredAndSortedItems = useMemo(() => {
    let items = [...visibleItems];

    if (filter99Store) {
      items = items.filter((vendor) =>
        store149Items.some((item) =>
          item.vendorId === vendor._id || (item.vendorId && typeof item.vendorId === "object" && item.vendorId._id === vendor._id)
        )
      );
    }
    if (filterFastDelivery) {
      items = items.filter((vendor) => {
        if (!vendor.time) return false;
        const match = vendor.time.match(/\d+/);
        return match ? parseInt(match[0]) <= 30 : false;
      });
    }
    if (filterOffers) {
      items = items.filter((vendor) => vendor.deliveryFee === 0 || (vendor.offer && vendor.offer.toLowerCase().includes("free")));
    }
    if (filterMinRating > 0) {
      items = items.filter((vendor) => (vendor.rating || 0) >= filterMinRating);
    }
    if (filterOpenNow) {
      items = items.filter((vendor) => (vendor.openState ? vendor.openState.isOpen : vendor.isOpen !== false));
    }
    if (filterCostRange !== "all") {
      items = items.filter((vendor) => {
        const cost = vendor.minOrderValue || 0;
        if (filterCostRange === "under300") return cost < 300;
        if (filterCostRange === "300to600") return cost >= 300 && cost <= 600;
        if (filterCostRange === "over600") return cost > 600;
        return true;
      });
    }
    if (filterVegNonVeg !== "all") {
      items = items.filter((vendor) => {
        const isVeg = vendor.isPureVeg === true || vendor.isVeg === true;
        if (filterVegNonVeg === "veg") return isVeg;
        if (filterVegNonVeg === "nonveg") return !isVeg;
        return true;
      });
    }
    if (selectedCuisines.length > 0) {
      items = items.filter((vendor) => Array.isArray(vendor.categories) && vendor.categories.some((cat: string) => selectedCuisines.includes(cat)));
    }

    if (selectedSort === "distance") {
      // Items with no distanceKm (the admin lat=0/lng=0 payload) park at the end.
      items.sort(
        (a, b) =>
          (typeof a.distanceKm === "number" ? a.distanceKm : Number.POSITIVE_INFINITY) -
          (typeof b.distanceKm === "number" ? b.distanceKm : Number.POSITIVE_INFINITY)
      );
    } else if (selectedSort === "time") {
      items.sort((a, b) => {
        const tA = a.time ? parseInt(a.time.match(/\d+/)?.[0] || "999") : 999;
        const tB = b.time ? parseInt(b.time.match(/\d+/)?.[0] || "999") : 999;
        return tA - tB;
      });
    } else if (selectedSort === "rating") {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === "costLowHigh") {
      items.sort((a, b) => (a.minOrderValue || 0) - (b.minOrderValue || 0));
    } else if (selectedSort === "costHighLow") {
      items.sort((a, b) => (b.minOrderValue || 0) - (a.minOrderValue || 0));
    }

    return items;
  }, [visibleItems, selectedSort, filter99Store, filterFastDelivery, filterOffers, filterMinRating, filterOpenNow, filterCostRange, filterVegNonVeg, selectedCuisines, store149Items]);

  const availableCuisines = useMemo(() => {
    const cuisinesSet = new Set<string>();
    const items = activeService === "Meat" ? meatCenters : restaurants;
    items.forEach((item) => {
      if (Array.isArray(item.categories)) item.categories.forEach((cat: string) => cuisinesSet.add(cat));
    });
    return Array.from(cuisinesSet).slice(0, 20);
  }, [restaurants, meatCenters, activeService]);

  const cuisineChips = availableCuisines.length > 0
    ? availableCuisines.slice(0, 8)
    : activeService === "Meat" ? DEFAULT_MEAT_TYPES : DEFAULT_CUISINES;

  const showCategories = !hasNoLocation && (showHomeSkeleton || loadingDrivers || visibleItems.length > 0 || (nearbyDriversCount ?? 0) > 0);

  const heroBanners = useMemo(
    () => banners.filter((b) => (!b.itemType || b.itemType === "banner") && (!b.position || b.position === "hero" || b.position === "inline")),
    [banners]
  );
  const greetingAds = useMemo(() => banners.filter((b) => b.itemType === "ad" && b.position === "below_greetings"), [banners]);

  const promoCards = heroBanners.length > 0
    ? heroBanners.map((b) => ({ eyebrow: "Offer", headline: b.title, caption: b.description || "" }))
    : activeService === "Meat" ? MEAT_PROMOS : FOOD_PROMOS;

  useEffect(() => {
    const interval = setInterval(() => {
      let next = bannerIndexRef.current + 1;
      if (next >= promoCards.length) next = 0;
      carouselRef.current?.scrollTo({ x: next * STRIDE, animated: true });
      bannerIndexRef.current = next;
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCards.length]);

  const scrollY = useSharedValue(0);
  const isStickyVisibleShared = useSharedValue(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  const stickyHeaderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [330, 360], [-120, 0], "clamp") }],
    opacity: interpolate(scrollY.value, [330, 350], [0, 1], "clamp"),
  }));

  const onMainScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    const visible = event.contentOffset.y >= 330;
    if (visible !== isStickyVisibleShared.value) {
      isStickyVisibleShared.value = visible;
      runOnJS(setIsStickyVisible)(visible);
    }
  });

  const listData = useMemo(() => {
    if (showHomeSkeleton) return HOME_SKELETON_ITEMS.map((item) => ({ ...item, isSkeleton: true }));
    if (!loadingDrivers && nearbyDriversCount === 0) return [];
    if (!searchText) return filteredAndSortedItems.map((item) => ({ ...item, isRestaurant: true }));

    const items: any[] = [];
    if (filteredAndSortedItems.length > 0) {
      items.push({ _id: "header-restaurants", isHeader: true, title: "RESTAURANTS" });
      filteredAndSortedItems.forEach((r) => items.push({ ...r, isRestaurant: true }));
    }
    if (searchedDishes.length > 0) {
      items.push({ _id: "header-dishes", isHeader: true, title: "DISHES & FOOD ITEMS" });
      searchedDishes.forEach((d) => items.push({ ...d, isDish: true }));
    }
    return items;
  }, [showHomeSkeleton, searchText, filteredAndSortedItems, searchedDishes, loadingDrivers, nearbyDriversCount]);

  const areaLabel = selectedAddress?.label && selectedAddress.label !== "Other" ? selectedAddress.label : "Home";
  const areaLine = selectedAddress?.addressLine || selectedAddress?.city || "your area";

  const activeFilterCount = [
    filter99Store, filterFastDelivery, filterOffers, filterMinRating > 0, filterOpenNow,
    filterCostRange !== "all", filterVegNonVeg !== "all", selectedCuisines.length > 0,
    appliedDistanceKm !== null, selectedSort !== "relevance",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedSort("relevance");
    setFilter99Store(false);
    setFilterFastDelivery(false);
    setFilterOffers(false);
    setFilterMinRating(0);
    setFilterOpenNow(false);
    setFilterCostRange("all");
    setFilterVegNonVeg("all");
    setSelectedCuisines([]);
    setDistanceOption("5");
    setCustomDistance("");
    setAppliedDistanceKm(null);
    // Radius and the server-side filters are cached against these coords, so drop
    // the cache or the refetch would be swallowed by the guard in the fetch effect.
    useHomeStore.setState({ lastFetchedCoords: null });
  };

  // True while the debounce or either search request is still in flight — the
  // window in which the list used to claim "No results found" prematurely.
  const isSearching =
    searchText.trim().length > 0 &&
    (searchQuery !== searchText.trim() ||
      isSearchingDishes ||
      // /meat/nearby has no search parameter, so only the Food list waits on a refetch.
      (activeService !== "Meat" && appliedSearchTerm !== searchQuery));

  // Re-attempts GPS from scratch: drops any saved address and the cached
  // "user denied GPS" flag, then nudges the address-loading effect to re-run.
  const handleUseCurrentLocation = async () => {
    try {
      await AsyncStorage.removeItem("gps_permission_denied");
      await AsyncStorage.removeItem("active_address");
    } catch (e) {
      console.error("Failed to reset location prefs:", e);
    }
    setSelectedAddress(null);
    setDistanceRefreshKey((v) => v + 1);
  };

  const renderHeader = () => {
    const hasRidersButNoVendors = !showHomeSkeleton && !loadingDrivers && (nearbyDriversCount ?? 0) > 0 && visibleItems.length === 0;
    if (!showCategories || ((!showHomeSkeleton && visibleItems.length === 0) && !hasRidersButNoVendors)) return null;

    return (
      <HomeBody
        hasRidersButNoVendors={hasRidersButNoVendors}
        accent={accent}
        activeFilterCount={activeFilterCount}
        activeService={activeService}
        appliedDistanceKm={appliedDistanceKm}
        areaLabel={areaLabel}
        areaLine={areaLine}
        bannerIndexRef={bannerIndexRef}
        bannerScrollX={bannerScrollX}
        carouselRef={carouselRef}
        cuisineChips={cuisineChips}
        filterCostRange={filterCostRange}
        filterFastDelivery={filterFastDelivery}
        filterMinRating={filterMinRating}
        filterOffers={filterOffers}
        filterOpenNow={filterOpenNow}
        filterVegNonVeg={filterVegNonVeg}
        filteredAndSortedItems={filteredAndSortedItems}
        greetingAds={greetingAds}
        handleServiceSwitch={handleServiceSwitch}
        insets={insets}
        onBannerScroll={onBannerScroll}
        promoCards={promoCards}
        restaurants={restaurants}
        searchBarAnimatedStyle={searchBarAnimatedStyle}
        selectedCuisines={selectedCuisines}
        setActiveFilterTab={setActiveFilterTab}
        setFilterCostRange={setFilterCostRange}
        setFilterFastDelivery={setFilterFastDelivery}
        setFilterMinRating={setFilterMinRating}
        setFilterOffers={setFilterOffers}
        setFilterOpenNow={setFilterOpenNow}
        setFilterVegNonVeg={setFilterVegNonVeg}
        setIsDistanceSheetOpen={setIsDistanceSheetOpen}
        setIsFilterModalVisible={setIsFilterModalVisible}
        setIsSearchActive={setIsSearchActive}
        setSelectedCuisines={setSelectedCuisines}
        store149Items={store149Items}
        styles={styles}
        tokens={tokens}
      />
    );
  };

  return (
    <ScreenShell>
      {isStickyVisible && (
        <StickyHeader
          activeService={activeService}
          areaLabel={areaLabel}
          handleServiceSwitch={handleServiceSwitch}
          insets={insets}
          stickyHeaderAnimatedStyle={stickyHeaderAnimatedStyle}
          styles={styles}
          tokens={tokens}
        />
      )}

      <AnimatedFlashList
        data={listData}
        keyExtractor={(item: any) => item._id}
        getItemType={(item: any) => (item.isSkeleton ? "skeleton" : item.isHeader ? "header" : item.isDish ? "dish" : "restaurant")}
        renderItem={({ item, index }: { item: any; index: number }) => {
          if (item.isSkeleton) return <HomeSkeletonCard tokens={tokens} />;
          if (item.isHeader) return <Text style={styles.listSectionHeader}>{item.title}</Text>;
          if (item.isRestaurant) {
            return (
              <Animated.View entering={staggerListItem(index)}>
                <RestaurantListItem {...item} isMeat={activeService === "Meat"} />
              </Animated.View>
            );
          }
          if (item.isDish) {
            return (
              <Animated.View entering={staggerListItem(index)}>
                <DishSearchResultItem item={item} tokens={tokens} accent={accent} styles={styles} />
              </Animated.View>
            );
          }
          return null;
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => {
          if (showHomeSkeleton || loadingDrivers) return null;

          if (hasNoLocation) {
            return (
              <NoRidersState
                handleUseCurrentLocation={handleUseCurrentLocation}
                styles={styles}
                tokens={tokens}
              />
            );
          }
          if (isSearching) {
            return (
              <EmptySearchState
                accent={accent}
                searchText={searchText}
                styles={styles}
              />
            );
          }
          if (searchText) {
            const hasActiveFilters = activeFilterCount > 0;
            const tryInstead = activeService === "Meat" ? ["Chicken curry cut", "Mutton", "Prawns"] : ["Biryani", "Pizza", "₹149 meals"];
            return (
              <HomeEmptySearchContainer
                hasActiveFilters={hasActiveFilters}
                tryInstead={tryInstead}
                activeFilterCount={activeFilterCount}
                clearAllFilters={clearAllFilters}
                searchText={searchText}
                setSearchText={setSearchText}
                styles={styles}
                tokens={tokens}
              />
            );
          }
          if (nearbyDriversCount === 0) {
            return (
              <HomeNoServiceContainer
                accent={accent}
                checkNearbyDrivers={checkNearbyDrivers}
                getCoords={getCoords}
                isRetryingDrivers={isRetryingDrivers}
                setIsRetryingDrivers={setIsRetryingDrivers}
                styles={styles}
              />
            );
          }
          if (visibleItems.length === 0) {
            const serviceName = activeService === "Meat" ? "meat" : "food";
            return (
              <HomeNoServiceContainer2
                serviceName={serviceName}
                styles={styles}
                tokens={tokens}
              />
            );
          }
          if (activeFilterCount > 0) {
            return (
              <HomeNoServiceContainer3
                activeFilterCount={activeFilterCount}
                clearAllFilters={clearAllFilters}
                styles={styles}
                tokens={tokens}
              />
            );
          }
          return null;
        }}
        ListFooterComponent={() => (
          <View>
            {loadingMore ? <ActivityIndicator size="small" color={accent.accent} style={{ marginVertical: 20 }} /> : <View style={{ height: 24 }} />}
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 140 : tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={async () => {
          setPage(1);
          setHasMore(true);
          const { lat, lng } = await getCoords();
          checkNearbyDrivers(lat, lng);
          if (activeService === "Meat") fetchMeatCenters(lat, lng, 1);
          else { fetchVendors(lat, lng, 1); fetch149StoreItems(lat, lng); }
        }}
        onScroll={onMainScroll}
        scrollEventThrottle={16}
      />

      <AppTabBar active="home" accent={activeService === "Meat" ? "meat" : "food"} cartVendorName={cartVendorName} />

      {/* Search overlay */}
      <HomeSearchOverlay
        activeService={activeService}
        accent={accent}
        addRecentSearch={addRecentSearch}
        clearRecentSearches={clearRecentSearches}
        insets={insets}
        isSearchVisible={isSearchVisible}
        isSearching={isSearching}
        listData={listData}
        recentSearches={recentSearches}
        searchBackdropAnimatedStyle={searchBackdropAnimatedStyle}
        searchBackdropOpacity={searchBackdropOpacity}
        searchSheetAnimatedStyle={searchSheetAnimatedStyle}
        searchText={searchText}
        searchTranslateY={searchTranslateY}
        setIsSearchActive={setIsSearchActive}
        setSearchText={setSearchText}
        styles={styles}
        tokens={tokens}
      />

      {/* Distance sheet */}
      <DistanceSheet
        appliedDistanceKm={appliedDistanceKm}
        applyDistanceFilter={applyDistanceFilter}
        clearDistanceFilter={clearDistanceFilter}
        customDistance={customDistance}
        distanceOption={distanceOption}
        insets={insets}
        isDistanceSheetOpen={isDistanceSheetOpen}
        setCustomDistance={setCustomDistance}
        setDistanceOption={setDistanceOption}
        setIsDistanceSheetOpen={setIsDistanceSheetOpen}
        styles={styles}
        tokens={tokens}
      />

      {/* Startup ad */}
      {activeStartupAd && (
        <StartupAdModal
          activeStartupAd={activeStartupAd}
          hasShownStartupAd={hasShownStartupAd}
          setActiveStartupAd={setActiveStartupAd}
          styles={styles}
          tokens={tokens}
        />
      )}

      {/* Filter modal */}
      <HomeFilterModal
        accent={accent}
        activeFilterTab={activeFilterTab}
        availableCuisines={availableCuisines}
        clearAllFilters={clearAllFilters}
        filter99Store={filter99Store}
        filterCostRange={filterCostRange}
        filterFastDelivery={filterFastDelivery}
        filterMinRating={filterMinRating}
        filterOffers={filterOffers}
        filterOpenNow={filterOpenNow}
        filterVegNonVeg={filterVegNonVeg}
        filteredAndSortedItems={filteredAndSortedItems}
        isFilterModalVisible={isFilterModalVisible}
        selectedCuisines={selectedCuisines}
        selectedSort={selectedSort}
        setActiveFilterTab={setActiveFilterTab}
        setFilter99Store={setFilter99Store}
        setFilterCostRange={setFilterCostRange}
        setFilterFastDelivery={setFilterFastDelivery}
        setFilterMinRating={setFilterMinRating}
        setFilterOffers={setFilterOffers}
        setFilterOpenNow={setFilterOpenNow}
        setFilterVegNonVeg={setFilterVegNonVeg}
        setIsFilterModalVisible={setIsFilterModalVisible}
        setSelectedCuisines={setSelectedCuisines}
        setSelectedSort={setSelectedSort}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}

// Animated dot for the promo carousel's page indicator — its own component
// (rather than inline in a .map()) because useAnimatedStyle is a hook.
