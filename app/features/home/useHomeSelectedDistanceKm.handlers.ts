import { getNearbyMeatCentres, getNearbyVendors, getStore149 } from "@/services/catalog.service";
import { getNearbyDriversWithHeaders } from "@/services/places.service";

// Handlers lifted out of useHomeSelectedDistanceKm: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.

export const buildFetchVendors = (discoveryParams: any, setRestaurants: any, setLoading: any, searchQuery: any, setAppliedSearchTerm: any, setLoadingMore: any, page: any, setHasMore: any) =>
  async (lat: number, lng: number, pageNum: number = 1) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      // The server matches a restaurant through its menu items too, which is the
      // only way a dish word like "Dosa" can surface the outlets that serve it.
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const data = await getNearbyVendors<any>(lat, lng, pageNum, `${discoveryParams}${searchParam}`);
      setAppliedSearchTerm(searchQuery);
      if (Array.isArray(data)) {
        if (data.length < 20) setHasMore(false); else setHasMore(true);
        if (pageNum === 1) {
          setRestaurants(data);
        } else {
          setRestaurants((prev: any) => {
            const newItems = data.filter((d) => !prev.some((p: any) => p._id === d._id));
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

export const buildFetchMeatCenters = (discoveryParams: any, setMeatCenters: any, setLoading: any, setLoadingMore: any, page: any, setHasMore: any) =>
  async (lat: number, lng: number, pageNum: number = 1) => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      const data = await getNearbyMeatCentres<any>(lat, lng, pageNum, discoveryParams);
      if (Array.isArray(data)) {
        if (data.length < 20) setHasMore(false); else setHasMore(true);
        if (pageNum === 1) {
          setMeatCenters(data);
        } else {
          setMeatCenters((prev: any) => {
            const newItems = data.filter((d) => !prev.some((p: any) => p._id === d._id));
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

export const buildCheckNearbyDrivers = (setNearbyDriversCount: any, setLoadingDrivers: any, token: any) =>
  async (lat: number, lng: number, opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoadingDrivers(true);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Same request (and URL handling) as homeStore's first load. This used to
      // build the URL from EXPO_PUBLIC_API_URL by hand, missing /api/v1, so every
      // refresh 404'd and a stale "riders available" count stuck around.
      const drivers = await getNearbyDriversWithHeaders(`latitude=${lat}&longitude=${lng}&radius=5000`, headers);
      setNearbyDriversCount(Array.isArray(drivers) ? drivers.length : 0);
    } catch (error) {
      console.error("Error checking nearby drivers:", error);
      // Can't confirm any rider is online, so don't offer ordering on a stale count.
      setNearbyDriversCount(0);
    } finally {
      if (!opts?.silent) setLoadingDrivers(false);
    }
  };

export const buildFetch149StoreItems = (setStore149Items: any, setLoading149: any) =>
  async (lat: number, lng: number) => {
    try {
      setLoading149(true);
      const data = await getStore149(lat, lng);
      setStore149Items(data);
    } catch (error) {
      console.error("Error fetching 149 store items:", error);
    } finally {
      setLoading149(false);
    }
  };
