import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useJsApiLoader } from "@react-google-maps/api";
import { adminFetch } from "@/lib/api-client";
import { useListQuery } from "@/hooks/useListQuery";
import type { AdminDriver, AdminOrderSummary, NewDriverForm } from "../types";

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "BLOCKED", label: "Blocked Only" },
];

const EMPTY_NEW_DRIVER: NewDriverForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  vehicleType: "bike",
  role: "DRIVER",
};

// Kept verbatim from the pre-refactor page: shown when the API returns no
// drivers, so the Fleet Directory demo/staging view isn't empty.
const DEFAULT_MOCK_DRIVERS: AdminDriver[] = [
  {
    _id: "mock-1",
    status: "ONLINE",
    vehicleType: "bike",
    vehicleNumber: "AP39XX1234",
    currentLocation: { coordinates: [81.804, 17.0005] },
    user: { name: "Sunand", phone: "+91 97040 72652", email: "sunand@flavour.com", isBlocked: false },
    rating: 4.8,
  },
  {
    _id: "mock-2",
    status: "ONLINE",
    vehicleType: "scooter",
    vehicleNumber: "AP39XX5678",
    currentLocation: { coordinates: [81.801, 17.0025] },
    user: { name: "Mahi", phone: "+91 88832 49896", email: "mahi@flavour.com", isBlocked: false },
    rating: 4.8,
  },
  {
    _id: "mock-3",
    status: "ONLINE",
    vehicleType: "bike",
    vehicleNumber: "AP39XX9012",
    currentLocation: { coordinates: [81.798, 17.001] },
    user: { name: "Dow Testing", phone: "+91 76701 76422", email: "dow@flavour.com", isBlocked: false },
    rating: 4.9,
  },
  {
    _id: "mock-4",
    status: "BUSY",
    vehicleType: "bike",
    vehicleNumber: "AP39XX1122",
    currentLocation: { coordinates: [82.235, 16.983] },
    user: { name: "Ram Prasad", phone: "+91 88970 99881", email: "ram@flavour.com", isBlocked: false },
    rating: 4.7,
  },
  {
    _id: "mock-5",
    status: "OFFLINE",
    vehicleType: "scooter",
    vehicleNumber: "AP39XX3344",
    currentLocation: { coordinates: [81.8055, 17.006] },
    user: { name: "Venkatesh", phone: "+91 94920 11223", email: "venkatesh@flavour.com", isBlocked: false },
    rating: 4.6,
  },
  {
    _id: "mock-6",
    status: "OFFLINE",
    vehicleType: "bike",
    vehicleNumber: "AP39XX5566",
    currentLocation: { coordinates: [81.8005, 17.004] },
    user: { name: "Srinivas", phone: "+91 91234 56780", email: "srinivas@flavour.com", isBlocked: false },
    rating: 4.5,
  },
  {
    _id: "mock-7",
    status: "ONLINE",
    vehicleType: "bike",
    vehicleNumber: "AP39XX7788",
    currentLocation: { coordinates: [81.802, 16.999] },
    user: { name: "Kalyan", phone: "+91 98765 43210", email: "kalyan@flavour.com", isBlocked: false },
    rating: 4.7,
  },
];

/**
 * All Fleet Directory tab state/query/mutation logic for Drivers.tsx (work
 * queue item #1). Moved out of the page as-is; nothing here changes
 * behavior from the original inline implementation. Zone-assignment and
 * order-chat state are deliberately in their own hooks (useZoneAssignment,
 * useDriverChat) rather than folded in here, per the plan's "do not create
 * one giant unmaintainable hook" rule.
 */
export function useDriversList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilterState] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [viewingDriver, setViewingDriver] = useState<AdminDriver | null>(null);
  const [newDriver, setNewDriver] = useState<NewDriverForm>(EMPTY_NEW_DRIVER);

  // Kept from the pre-refactor page: mapCenter/handleFocusOnMap's setMapCenter
  // call have no visible effect today (the GoogleMap this fed was already
  // unrendered before this refactor -- imported and computed, never mounted
  // in JSX), but the toast success/error from clicking "View on map" / the
  // pin icon is real, so the handler is preserved rather than dropped.
  const [mapCenter, setMapCenter] = useState({ lat: 17.0005, lng: 81.804 });

  // Also kept from the pre-refactor page: `isLoaded` itself is unused (the
  // GoogleMap it would gate is not rendered), but the hook call is not a
  // no-op -- it injects the Google Maps JS API <script> tag as a side
  // effect, so removing the call would be a real behavior change.
  useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });

  const {
    items: drivers,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    searchedItems: searchedDrivers,
    paginate,
  } = useListQuery<AdminDriver>({
    queryKey: ["admin", "drivers"],
    queryFn: async () => {
      const data = await adminFetch<AdminDriver[]>("/admin/drivers");
      return data && data.length > 0 ? data : DEFAULT_MOCK_DRIVERS;
    },
    itemsPerPage: 5,
    searchFields: (d) => [d.user?.name, d.user?.phone, d.user?.email, d.vehicleNumber],
  });

  const setStatusFilter = (value: string) => {
    setStatusFilterState(value);
    setCurrentPage(1);
  };

  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<AdminOrderSummary[]>("/admin/orders"),
  });

  const createDriverMutation = useMutation({
    mutationFn: (data: NewDriverForm) =>
      adminFetch("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver onboarded successfully");
      setIsAddOpen(false);
      setNewDriver(EMPTY_NEW_DRIVER);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to onboard driver");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver status updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update driver status");
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify({ isBlocked }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver block status updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update block status");
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminDriver> }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver dossier updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update driver dossier");
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/drivers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success("Driver registration deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete driver");
    },
  });

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone) {
      toast.error("Name and phone are required");
      return;
    }
    createDriverMutation.mutate(newDriver);
  };

  const handleToggleStatus = (driver: AdminDriver) => {
    const nextStatus = driver.status === "ONLINE" ? "OFFLINE" : "ONLINE";
    toggleStatusMutation.mutate({ id: driver._id, status: nextStatus });
  };

  const handleToggleBlock = (driver: AdminDriver) => {
    toggleBlockMutation.mutate({ id: driver._id, isBlocked: !driver.user?.isBlocked });
  };

  const handleDeleteClick = (driver: AdminDriver) => {
    if (confirm(`Are you sure you want to remove driver ${driver.user?.name}?`)) {
      deleteDriverMutation.mutate(driver._id);
    }
  };

  const handleViewClick = (driver: AdminDriver) => {
    setViewingDriver(driver);
    setIsViewOpen(true);
  };

  const handleFocusOnMap = (driver: AdminDriver) => {
    const lng = driver.currentLocation?.coordinates?.[0];
    const lat = driver.currentLocation?.coordinates?.[1];
    if (lat && lng) {
      setMapCenter({ lat, lng });
      toast.success(`Centered map on ${driver.user?.name}`);
    } else {
      toast.error("No active coordinates for this driver");
    }
  };

  // Profile photo fallbacks matching names in image
  const getAvatarUrl = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("sunand"))
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80";
    if (lower.includes("mahi"))
      return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80";
    if (lower.includes("dow") || lower.includes("test"))
      return "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80";
    if (lower.includes("ram"))
      return "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80";
    if (lower.includes("venkatesh"))
      return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  // Location helpers matching mock image
  const getLocationDetails = (driver: AdminDriver) => {
    const name = driver.user?.name?.toLowerCase() || "";
    if (name.includes("sunand")) return { main: "Tadepalligudem", sub: "Near Railway Station" };
    if (name.includes("mahi")) return { main: "Tadepalligudem", sub: "Main Market Area" };
    if (name.includes("dow") || name.includes("test")) return { main: "Tadepalligudem", sub: "Bus Stand Area" };
    if (name.includes("ram")) return { main: "Kakinada", sub: "Near RTC Complex" };
    if (name.includes("venkatesh")) return { main: "Last seen", sub: "2 hours ago" };

    const coords = driver.currentLocation?.coordinates;
    if (coords && coords[1] && coords[0]) {
      return { main: `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`, sub: "Active Coordinates" };
    }
    return { main: "Unknown", sub: "Offline Location" };
  };

  const getVehicleString = (driver: AdminDriver) => {
    const capType = driver.vehicleType
      ? driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1)
      : "Bike";
    const num = driver.vehicleNumber || `AP39XX${1000 + Math.floor(Math.random() * 8999)}`;
    return `${num} • ${capType}`;
  };

  const ordersToday = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const totalOrdersCount = ordersToday.length > 0 ? ordersToday.length : 24;
  const completedCount =
    ordersToday.filter((o) => ["DELIVERED", "COMPLETED", "delivered", "completed"].includes(o.status || "")).length ||
    18;
  const cancelledCount =
    ordersToday.filter((o) => ["CANCELLED", "cancelled", "rejected", "failed"].includes(o.status || "")).length || 3;
  const totalEarningsSum = ordersToday.reduce((sum, o) => sum + (o.totalPrice || o.deliveryFee || 0), 0);
  const totalEarningsToday = totalEarningsSum > 0 ? `₹${totalEarningsSum.toFixed(2)}` : "₹0.00";

  const activeOrdersCount = orders.filter((o) =>
    ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(
      o.status || ""
    )
  ).length;
  const liveOrdersDisplay = activeOrdersCount > 0 ? activeOrdersCount : 24;

  const onlineDrivers = drivers.filter((d) => d.status === "ONLINE").length;

  const filteredDrivers = searchedDrivers.filter((d) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ONLINE") return d.status === "ONLINE";
    if (statusFilter === "OFFLINE") return d.status === "OFFLINE";
    if (statusFilter === "BLOCKED") return d.user?.isBlocked === true;
    return true;
  });

  const { pageItems: paginatedDrivers, totalPages, safePage } = paginate(filteredDrivers);

  const driverMarkers = searchedDrivers
    .map((d) => {
      const lng = d.currentLocation?.coordinates?.[0] || 81.804;
      const lat = d.currentLocation?.coordinates?.[1] || 17.0005;
      return {
        lat: Number(lat),
        lng: Number(lng),
        name: d.user?.name || "Driver",
        vehicle: d.vehicleNumber || "VAN",
        status: d.status,
      };
    })
    .filter((m) => !isNaN(m.lat) && !isNaN(m.lng));

  return {
    drivers,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusFilterOptions: STATUS_FILTER_OPTIONS,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedDrivers,
    filteredDrivers,
    searchedDrivers,
    orders,
    onlineDrivers,
    totalOrdersCount,
    completedCount,
    cancelledCount,
    totalEarningsToday,
    liveOrdersDisplay,
    ordersToday,
    isAddOpen,
    setIsAddOpen,
    newDriver,
    setNewDriver,
    handleOnboardSubmit,
    isCreating: createDriverMutation.isPending,
    isViewOpen,
    setIsViewOpen,
    viewingDriver,
    setViewingDriver,
    isDownloadOpen,
    setIsDownloadOpen,
    handleViewClick,
    handleToggleStatus,
    handleToggleBlock,
    handleDeleteClick,
    handleFocusOnMap,
    getAvatarUrl,
    getLocationDetails,
    getVehicleString,
    updateDriverMutation,
    // Retained but not rendered anywhere -- see the mapCenter comment above.
    mapCenter,
    driverMarkers,
  };
}
