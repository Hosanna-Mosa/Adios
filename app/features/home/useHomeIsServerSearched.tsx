import { useMemo } from "react";

// Part 9 of useHome, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useHomeIsServerSearched(restaurants: any, meatCenters: any, store149Items: any, activeService: any, searchText: any, searchQuery: any, appliedSearchTerm: any, selectedSort: any, filter99Store: any, filterFastDelivery: any, filterOffers: any, filterMinRating: any, filterOpenNow: any, filterCostRange: any, filterVegNonVeg: any, selectedCuisines: any, dishVendorIds: any) {
  // For Food the server already matched restaurants through their menus, so a
  // second name-only pass here would throw those hits away. /meat/nearby has no
  // search parameter, so meat keeps the local match, widened by the dish hits.
  const isServerSearched = activeService !== "Meat" && !!searchQuery && appliedSearchTerm === searchQuery;

  const filteredItems = useMemo(() => {
    return (activeService === "Meat" ? meatCenters : restaurants).filter((item: any) => {
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
        store149Items.some((item: any) =>
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

  return { visibleItems, filteredAndSortedItems };
}
