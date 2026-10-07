import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { appConfirm } from "@/lib/dialog";
import { useListQuery } from "@/hooks/useListQuery";
import type { AdminDriver, AdminOrderSummary } from "../types";

const getStatusFilterOptions = (t: (key: string) => string) => [
  { value: "ALL", label: t("dashboard.allStatuses") },
  { value: "ONLINE", label: t("drivers.online") },
  { value: "OFFLINE", label: t("drivers.offline") },
  { value: "BLOCKED", label: t("users.blockedOnly") },
];

const COMPLETED_STATUSES = ["DELIVERED", "COMPLETED", "delivered", "completed"];
const CANCELLED_STATUSES = ["CANCELLED", "cancelled", "rejected", "failed"];

/**
 * All Fleet Directory tab state/query/mutation logic for Drivers.tsx (work
 * queue item #1). Moved out of the page as-is; nothing here changes
 * behavior from the original inline implementation. Zone-assignment and
 * order-chat state are deliberately in their own hooks (useZoneAssignment,
 * useDriverChat) rather than folded in here, per the plan's "do not create
 * one giant unmaintainable hook" rule.
 */
export function useDriversList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilterState] = useState("ALL");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [viewingDriver, setViewingDriver] = useState<AdminDriver | null>(null);

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
    queryFn: async () => (await adminFetch<AdminDriver[]>("/admin/drivers")) || [],
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

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success(t("drivers.driverStatusUpdatedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToUpdateDriverStatus"));
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify({ isBlocked }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success(t("drivers.driverBlockStatusUpdated"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToUpdateBlockStatus"));
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminDriver> }) =>
      adminFetch(`/admin/drivers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success(t("drivers.driverDossierUpdatedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToUpdateDriverDossier"));
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/drivers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
      toast.success(t("drivers.driverRegistrationDeletedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("drivers.failedToDeleteDriver"));
    },
  });

  const handleToggleStatus = (driver: AdminDriver) => {
    const nextStatus = driver.status === "ONLINE" ? "OFFLINE" : "ONLINE";
    toggleStatusMutation.mutate({ id: driver._id, status: nextStatus });
  };

  const handleToggleBlock = (driver: AdminDriver) => {
    toggleBlockMutation.mutate({ id: driver._id, isBlocked: !driver.user?.isBlocked });
  };

  const handleDeleteClick = async (driver: AdminDriver) => {
    if (await appConfirm({ title: t("drivers.confirmRemoveDriver", { name: driver.user?.name, defaultValue: "Are you sure you want to remove driver {{name}}?" }), tone: "destructive" })) {
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
      // There is no in-page fleet map to centre (it was never rendered), so open
      // the driver's last-known position in Google Maps instead of a toast that
      // claimed to have centred one.
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank", "noopener,noreferrer");
    } else {
      toast.error(t("drivers.noLocationReportedForDriver"));
    }
  };

  // The driver's own photo (account profile picture, else the onboarding
  // selfie), or a generated initials avatar. This used to hand out Unsplash
  // stock portraits to anyone whose name matched "sunand", "mahi", "ram"...
  const getAvatarUrl = (driver: AdminDriver) => {
    const photo = driver.user?.profilePic || driver.selfieImage;
    if (photo) return photo;
    const name = driver.user?.name || "";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  // Reports the driver's actual last-known position. This used to match on the
  // driver's *name* and invent a town for it ("sunand" → Tadepalligudem, Near
  // Railway Station), so the Current Location column showed confident, entirely
  // fictional places for anyone whose name happened to match.
  const getLocationDetails = (driver: AdminDriver) => {
    const coords = driver.currentLocation?.coordinates;
    if (coords && coords[1] && coords[0]) {
      return { main: `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`, sub: t("drivers.lastReportedPosition") };
    }
    return { main: t("drivers.unknown"), sub: t("drivers.noLocationReported") };
  };

  const getVehicleString = (driver: AdminDriver) => {
    // A missing registration is shown as missing, rather than a random plate that
    // changed on every re-render; a missing vehicle type is left out rather than
    // assumed to be "Bike".
    const num = driver.vehicleNumber || t("drivers.noVehicleNumber");
    if (!driver.vehicleType) return num;
    const capType = driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1);
    return `${num} • ${capType}`;
  };

  // Month-to-date earnings per driver, from this month's completed orders at the
  // driver's share of the fare (replaces a hardcoded "₹0.00 / Target: ₹0").
  const DRIVER_SHARE = 0.8;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const mtdByDriver = orders.reduce((acc: Record<string, { total: number; trips: number }>, o) => {
    if (!o.createdAt || !COMPLETED_STATUSES.includes(o.status || "")) return acc;
    if (new Date(o.createdAt) < monthStart) return acc;
    const driverId = typeof o.driver === "string" ? o.driver : o.driver?._id;
    if (!driverId) return acc;
    const entry = acc[driverId] || { total: 0, trips: 0 };
    entry.total += (o.totalPrice || 0) * DRIVER_SHARE;
    entry.trips += 1;
    acc[driverId] = entry;
    return acc;
  }, {});

  const getDriverMtdEarnings = (driverId: string) => mtdByDriver[driverId]?.total || 0;
  const getDriverMtdTrips = (driverId: string) => mtdByDriver[driverId]?.trips || 0;

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

  // Real counts only — these used to fall back to invented 24 / 18 / 3 whenever
  // the true figure was zero.
  const totalOrdersCount = ordersToday.length;
  const completedCount = ordersToday.filter((o) => COMPLETED_STATUSES.includes(o.status || "")).length;
  const cancelledCount = ordersToday.filter((o) => CANCELLED_STATUSES.includes(o.status || "")).length;
  const totalEarningsSum = ordersToday.reduce((sum, o) => sum + (o.totalPrice || o.deliveryFee || 0), 0);
  const totalEarningsToday = totalEarningsSum > 0 ? `₹${totalEarningsSum.toFixed(2)}` : "₹0.00";

  const activeOrdersCount = orders.filter((o) =>
    ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(
      o.status || ""
    )
  ).length;
  const liveOrdersDisplay = activeOrdersCount;

  const onlineDrivers = drivers.filter((d) => d.status === "ONLINE").length;

  // Real fleet average rating across drivers that actually carry one, and the
  // share of the fleet on duty — both were hardcoded ("4.8", "98%").
  const ratedDrivers = drivers.filter((d) => typeof d.rating === "number" && d.rating > 0);
  const averageRating =
    ratedDrivers.length > 0 ? (ratedDrivers.reduce((sum, d) => sum + (d.rating || 0), 0) / ratedDrivers.length).toFixed(1) : null;
  const fleetHealth = drivers.length > 0 ? Math.round((onlineDrivers / drivers.length) * 100) : 0;

  const filteredDrivers = searchedDrivers.filter((d) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ONLINE") return d.status === "ONLINE";
    if (statusFilter === "OFFLINE") return d.status === "OFFLINE";
    if (statusFilter === "BLOCKED") return d.user?.isBlocked === true;
    return true;
  });

  const { pageItems: paginatedDrivers, totalPages, safePage } = paginate(filteredDrivers);

  return {
    drivers,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    statusFilterOptions: getStatusFilterOptions(t),
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedDrivers,
    filteredDrivers,
    searchedDrivers,
    orders,
    onlineDrivers,
    averageRating,
    ratedDriversCount: ratedDrivers.length,
    fleetHealth,
    getDriverMtdEarnings,
    getDriverMtdTrips,
    totalOrdersCount,
    completedCount,
    cancelledCount,
    totalEarningsToday,
    liveOrdersDisplay,
    ordersToday,
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
  };
}
