import { create } from "zustand";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import { designTokens, type ServiceTokens } from "@/constants/colors";
import { getNearbyMeatCentres, getNearbyVendors, getStore149 } from "@/services/catalog.service";
import { getNearbyDriversWithHeaders } from "@/services/places.service";

/** Server-side discovery filters that must survive a refetch (see /vendors/nearby). */
export interface HomeFetchFilters {
  minRating?: number;
  openNow?: boolean;
  sort?: "distance" | "rating" | "default";
}

interface HomeState {
  restaurants: any[];
  meatCenters: any[];
  nearbyDriversCount: number | null;
  loading: boolean;
  loadingDrivers: boolean;
  store149Items: any[];
  activeService: 'Food' | 'Meat';
  lastFetchedCoords: { lat: number; lng: number } | null;
  lastFetchedService: 'Food' | 'Meat' | null;
  
  setRestaurants: (restaurants: any[] | ((prev: any[]) => any[])) => void;
  setMeatCenters: (meatCenters: any[] | ((prev: any[]) => any[])) => void;
  setNearbyDriversCount: (count: number | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingDrivers: (loading: boolean) => void;
  setStore149Items: (items: any[]) => void;
  setActiveService: (service: 'Food' | 'Meat') => void;
  
  fetchHomeData: (lat: number, lng: number, activeService: 'Food' | 'Meat', appliedDistanceKm?: number | null, filters?: HomeFetchFilters) => Promise<void>;
}

const buildFilterParams = (filters?: HomeFetchFilters) => {
  if (!filters) return "";
  const parts: string[] = [];
  if (filters.minRating && filters.minRating > 0) parts.push(`&minRating=${filters.minRating}`);
  if (filters.openNow) parts.push("&openNow=true");
  if (filters.sort && filters.sort !== "default") parts.push(`&sort=${filters.sort}`);
  return parts.join("");
};

/**
 * True only once the nearby-rider check has finished and found none. An
 * unknown count (not checked yet, e.g. a deep link straight to a restaurant)
 * is not treated as "no riders", so nothing is blocked on missing data.
 */
export const selectNoRidersOnline = (state: Pick<HomeState, "loadingDrivers" | "nearbyDriversCount">) =>
  !state.loadingDrivers && state.nearbyDriversCount === 0;

export const useHomeStore = create<HomeState>((set, get) => ({
  restaurants: [],
  meatCenters: [],
  nearbyDriversCount: null,
  loading: true,
  loadingDrivers: true,
  store149Items: [],
  activeService: 'Food',
  lastFetchedCoords: null,
  lastFetchedService: null,
  
  setRestaurants: (val) => set((state) => ({
    restaurants: typeof val === 'function' ? val(state.restaurants) : val
  })),
  setMeatCenters: (val) => set((state) => ({
    meatCenters: typeof val === 'function' ? val(state.meatCenters) : val
  })),
  setNearbyDriversCount: (nearbyDriversCount) => set({ nearbyDriversCount }),
  setLoading: (loading) => set({ loading }),
  setLoadingDrivers: (loadingDrivers) => set({ loadingDrivers }),
  setStore149Items: (store149Items) => set({ store149Items }),
  setActiveService: (activeService) => set({ activeService }),
  
  fetchHomeData: async (lat, lng, activeService, appliedDistanceKm = null, filters) => {
    set({ loading: true, loadingDrivers: true });
    
    // Get authorization token from authStore
    const token = useAuthStore.getState().token;
    const radiusParam = appliedDistanceKm ? `&radius=${Math.round(appliedDistanceKm * 1000)}` : "";
    // Rating / open-now / distance ordering are resolved server-side, so they have to
    // ride along here too — otherwise changing the address silently drops them.
    const filterParams = buildFilterParams(filters);
    
    try {
      // 1. Fetch drivers with exact same query params and headers as index.tsx
      const driversHeaders: any = {};
      if (token) {
        driversHeaders["Authorization"] = `Bearer ${token}`;
      }
      const driversPromise = getNearbyDriversWithHeaders(`latitude=${lat}&longitude=${lng}&radius=5000`, driversHeaders)
        .then((drivers) => {
          set({ nearbyDriversCount: Array.isArray(drivers) ? drivers.length : 0 });
        })
        .catch((err) => {
          console.error("Check drivers error in homeStore:", err);
          set({ nearbyDriversCount: 0 });
        })
        .finally(() => {
          set({ loadingDrivers: false });
        });

      // 2. Fetch main service data using the exact same endpoints as index.tsx
      let servicePromise;
      if (activeService === 'Meat') {
        servicePromise = getNearbyMeatCentres<any[]>(lat, lng, 1, `${radiusParam}${filterParams}`)
          .then((data) => {
            set({ meatCenters: Array.isArray(data) ? data : [] });
          })
          .catch((err) => {
            console.error("Fetch meat centers error in homeStore:", err);
            set({ meatCenters: [] });
          });
      } else {
        servicePromise = Promise.all([
          getNearbyVendors<any[]>(lat, lng, 1, `${radiusParam}${filterParams}`)
            .then((data) => {
              set({ restaurants: Array.isArray(data) ? data : [] });
            })
            .catch((err) => {
              console.error("Fetch vendors error in homeStore:", err);
              set({ restaurants: [] });
            }),
          getStore149<any[]>(lat, lng)
            .then((data) => {
              set({ store149Items: Array.isArray(data) ? data : [] });
            })
            .catch((err) => {
              console.error("Fetch 149 items error in homeStore:", err);
              set({ store149Items: [] });
            })
        ]);
      }

      await Promise.all([servicePromise]);
      set({ lastFetchedCoords: { lat, lng }, lastFetchedService: activeService });
    } catch (err) {
      console.error("fetchHomeData error:", err);
    } finally {
      set({ loading: false });
    }
  }
}));

/**
 * The active service's accent triple, resolved against the current theme.
 * Subscribes to both stores, so it re-renders on a Food/Meat switch and on a
 * theme change — this is the single source of truth every screen tints from.
 */
export const useServiceAccent = (): ServiceTokens => {
  const theme = useThemeStore((s) => s.theme);
  const activeService = useHomeStore((s) => s.activeService);
  return designTokens[theme].services[activeService === "Meat" ? "meat" : "food"];
};
