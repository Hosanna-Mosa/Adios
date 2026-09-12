import { useEffect, useMemo } from "react";
import { router } from "expo-router";
import { useHomeStore } from "@/contexts/homeStore";
import { buildCheckNearbyDrivers, buildFetch149StoreItems, buildFetchMeatCenters, buildFetchVendors } from "./useHomeSelectedDistanceKm.handlers";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeSelectedDistanceKm(setRestaurants: any, setMeatCenters: any, setNearbyDriversCount: any, loading: any, setLoading: any, loadingDrivers: any, setLoadingDrivers: any, setStore149Items: any, activeService: any, setActiveService: any, searchQuery: any, setAppliedSearchTerm: any, loadingMore: any, setLoadingMore: any, isRetryingDrivers: any, page: any, setPage: any, hasMore: any, setHasMore: any, token: any, selectedAddress: any, isAddressLoaded: any, setHasNoLocation: any, addressResolveRef: any, hasRedirectedRef: any, setIsDistanceSheetOpen: any, distanceOption: any, customDistance: any, appliedDistanceKm: any, setAppliedDistanceKm: any, distanceRefreshKey: any, setDistanceRefreshKey: any, setLoading149: any, selectedSort: any, filterMinRating: any, filterOpenNow: any, getCoords: any) {
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

  const fetchVendors = buildFetchVendors(discoveryParams, setRestaurants, setLoading, searchQuery, setAppliedSearchTerm, setLoadingMore, page, setHasMore);

  const fetchMeatCenters = buildFetchMeatCenters(discoveryParams, setMeatCenters, setLoading, setLoadingMore, page, setHasMore);

  const fetch149StoreItems = buildFetch149StoreItems(setStore149Items, setLoading149);

  // `silent` skips the global loadingDrivers flag — that flag drives the
  // full-screen skeleton, so flipping it for a button-level retry replaced
  // the empty state with a flash of skeleton cards instead of just updating
  // the button. The "Retry search" action passes silent:true and shows its
  // own inline spinner via isRetryingDrivers instead.
  const checkNearbyDrivers = buildCheckNearbyDrivers(setNearbyDriversCount, setLoadingDrivers, token);

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
    setDistanceRefreshKey((value: any) => value + 1);
  };

  return { serverFilterKey, fetchVendors, fetchMeatCenters, fetch149StoreItems, checkNearbyDrivers, loadMore, handleServiceSwitch, applyDistanceFilter };
}
