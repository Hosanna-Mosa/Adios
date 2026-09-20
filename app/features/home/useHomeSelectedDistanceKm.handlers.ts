import { customFetch } from "@/utils/api/custom-fetch";

// Handlers lifted out of useHomeSelectedDistanceKm: factories over the values they closed
// over, rebuilt every render exactly as the inline versions were.

export const buildFetchVendors = (discoveryParams: any, setRestaurants: any, setLoading: any, searchQuery: any, setAppliedSearchTerm: any, setLoadingMore: any, page: any, setHasMore: any) =>
  async (lat: number, lng: number, pageNum: number = 1) => {
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
      const data = await customFetch<any>(`/meat/nearby?lat=${lat}&lng=${lng}&page=${pageNum}&limit=20${discoveryParams}`);
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

export const buildFetch149StoreItems = (setStore149Items: any, setLoading149: any) =>
  async (lat: number, lng: number) => {
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
