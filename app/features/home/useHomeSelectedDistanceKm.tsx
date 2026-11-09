import { useEffect, useMemo } from "react";
import { useHomeStore } from "@/contexts/homeStore";
import { buildFetch149StoreItems, buildFetchMeatCenters, buildFetchVendors } from "./useHomeSelectedDistanceKm.handlers";
import type { SetState, HomeService, DistanceOption, MutableRefObject } from "./useHome.shared";

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeSelectedDistanceKm(setRestaurants: (v: any[] | ((prev: any[]) => any[])) => void, setMeatCenters: (v: any[] | ((prev: any[]) => any[])) => void, loading: boolean, setLoading: (v: boolean) => void, loadingDrivers: boolean, setLoadingDrivers: (v: boolean) => void, setStore149Items: (v: any[]) => void, activeService: HomeService, setActiveService: (v: HomeService) => void, searchQuery: string, setAppliedSearchTerm: SetState<string>, loadingMore: boolean, setLoadingMore: SetState<boolean>, page: number, setPage: SetState<number>, hasMore: boolean, setHasMore: SetState<boolean>, selectedAddress: any, isAddressLoaded: boolean, setHasNoLocation: SetState<boolean>, addressResolveRef: MutableRefObject<(() => void) | null>, hasRedirectedRef: MutableRefObject<boolean>, setIsDistanceSheetOpen: SetState<boolean>, distanceOption: DistanceOption, customDistance: string, appliedDistanceKm: number | null, setAppliedDistanceKm: SetState<number | null>, distanceRefreshKey: number, setDistanceRefreshKey: SetState<number>, setLoading149: SetState<boolean>, selectedSort: string, filterMinRating: number, filterOpenNow: boolean, getCoords: any) {
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

        // No location: Home shows the location sheet (LocationPromptSheet) over itself, with
        // enable / saved address / search choices, instead of pushing a screen.
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

  return { serverFilterKey, fetchVendors, fetchMeatCenters, fetch149StoreItems, loadMore, handleServiceSwitch, applyDistanceFilter };
}
