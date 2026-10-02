import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useJsApiLoader } from "@react-google-maps/api";
import { adminFetch } from "@/lib/api-client";
import type { AdminZone, LatLng, ZoneEditForm } from "../types";

export const DEFAULT_CENTER: LatLng = { lat: 12.92, lng: 77.64 }; // HSR Layout, Bangalore

/**
 * The main page's zones list/selection/map-preview state for Zones.tsx
 * (work queue item #2): the zones query, which zone is selected (and its
 * preview map center/zoom), and the delete/toggle mutations. The create
 * form's own state lives in useZoneForm instead, per "do not create one
 * giant unmaintainable hook".
 *
 * Also owns the single useJsApiLoader call: the page renders two separate
 * GoogleMap instances (this preview map, and the create dialog's drawing
 * map), but the Google Maps JS API script only needs loading once, so
 * `isLoaded` is returned here and threaded to both.
 */
export function useZonesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<AdminZone | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  // Kept from the pre-refactor page: written on map load but never read
  // anywhere else -- pre-existing dead-ish code, preserved as a move.
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });

  const { data: response = { data: [] }, isLoading } = useQuery({
    queryKey: ["admin", "zones"],
    queryFn: () => adminFetch<{ data: AdminZone[] }>("/zones"),
  });

  const zones = response.data || [];

  const handleSelectZone = (zone: AdminZone) => {
    setSelectedZone(zone);

    if (zone.type === "circle" && zone.center?.coordinates) {
      const lat = zone.center.coordinates[1];
      const lng = zone.center.coordinates[0];
      setMapCenter({ lat, lng });
      setMapZoom(14);
    } else if (zone.type === "polygon" && zone.boundary?.coordinates?.[0]?.[0]) {
      const firstNode = zone.boundary.coordinates[0][0];
      const lat = firstNode[1];
      const lng = firstNode[0];
      setMapCenter({ lat, lng });
      setMapZoom(13);
    }
  };

  // Set first zone as selected on load
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      handleSelectZone(zones[0]);
    }
  }, [zones]);

  const deleteZoneMutation = useMutation({
    mutationFn: (zoneId: string) => adminFetch(`/zones/${zoneId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      toast.success(t("zones.zoneDeletedSuccessfully"));
      if (selectedZone && zones.length > 1) {
        const remaining = zones.filter((z) => z._id !== selectedZone._id);
        if (remaining.length > 0) handleSelectZone(remaining[0]);
      } else {
        setSelectedZone(null);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t("zones.failedToDeleteZone"));
    },
  });

  const toggleZoneMutation = useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: Partial<AdminZone> }) =>
      adminFetch(`/zones/${zoneId}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      toast.success(t("zones.zoneUpdatedSuccessfully"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("zones.failedToUpdateZone"));
    },
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("zones.confirmDeleteZone"))) {
      deleteZoneMutation.mutate(id);
    }
  };

  const handleToggleActive = (zone: AdminZone, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleZoneMutation.mutate({ zoneId: zone._id, data: { isActive: !zone.isActive } });
  };

  const handleToggleAutoSurge = (zone: AdminZone, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleZoneMutation.mutate({ zoneId: zone._id, data: { autoSurgeEnabled: !zone.autoSurgeEnabled } });
  };

  // Full edit of an existing zone. Everything the model carries is editable here,
  // rather than the single name the old prompt() asked for.
  const [editingZone, setEditingZone] = useState<AdminZone | null>(null);
  const [editForm, setEditForm] = useState<ZoneEditForm>({
    name: "",
    description: "",
    pricingMultiplier: "1",
    radius: "1000",
    isActive: true,
  });

  const openEditZone = (zone: AdminZone) => {
    setEditingZone(zone);
    setEditForm({
      name: zone.name || "",
      description: zone.description || "",
      pricingMultiplier: String(zone.pricingMultiplier ?? 1),
      radius: String(zone.radius ?? 1000),
      isActive: Boolean(zone.isActive),
    });
  };

  const closeEditZone = () => setEditingZone(null);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    if (!editForm.name.trim()) {
      toast.error(t("zones.zoneNameRequired"));
      return;
    }
    const data: Partial<AdminZone> = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      pricingMultiplier: Number(editForm.pricingMultiplier) || 1,
      isActive: editForm.isActive,
    };
    // Radius only means anything for a circular zone; a polygon is defined by its
    // drawn boundary, which this form does not touch.
    if (editingZone.type === "circle") {
      data.radius = Number(editForm.radius) || 0;
    }
    toggleZoneMutation.mutate({ zoneId: editingZone._id, data }, { onSuccess: () => setEditingZone(null) });
  };

  // Keep the map-preview detail card in sync after an edit/toggle refetch.
  useEffect(() => {
    if (!selectedZone) return;
    const fresh = zones.find((z) => z._id === selectedZone._id);
    if (fresh && fresh !== selectedZone) setSelectedZone(fresh);
  }, [zones]);

  // Map Polygon/Circle helper functions for the selected zone's preview
  const getGoogleCoords = (zone: AdminZone): LatLng[] => {
    if (!zone?.boundary?.coordinates?.[0]) return [];
    return zone.boundary.coordinates[0].map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }));
  };

  const getGoogleCenter = (zone: AdminZone): LatLng => {
    if (!zone?.center?.coordinates) return DEFAULT_CENTER;
    return { lat: Number(zone.center.coordinates[1]), lng: Number(zone.center.coordinates[0]) };
  };

  // Determine pricing overlay colors based on multiplier
  const getZoneColors = (multiplier: number) => {
    if (multiplier >= 2.0) {
      return { fill: "#ef4444", stroke: "#dc2626" }; // Crimson red
    } else if (multiplier >= 1.5) {
      return { fill: "#f97316", stroke: "#ea580c" }; // Vivid orange
    } else if (multiplier > 1.0) {
      return { fill: "#eab308", stroke: "#ca8a04" }; // Yellow/amber
    }
    return { fill: "#6366f1", stroke: "#4f46e5" }; // Slate/indigo
  };

  return {
    isLoaded,
    zones,
    isLoading,
    selectedZone,
    mapCenter,
    mapZoom,
    mapRef,
    handleSelectZone,
    handleDelete,
    handleToggleActive,
    handleToggleAutoSurge,
    editingZone,
    editForm,
    setEditForm,
    openEditZone,
    closeEditZone,
    handleEditSubmit,
    isSavingEdit: toggleZoneMutation.isPending,
    getGoogleCoords,
    getGoogleCenter,
    getZoneColors,
  };
}
