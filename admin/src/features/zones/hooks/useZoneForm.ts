import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { AdminZone, LatLng, NewZonePayload } from "../types";
import { DEFAULT_CENTER } from "./useZonesList";

// Helper to compute distance between two coordinates in meters
const getDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3; // meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface UseZoneFormOptions {
  onCreated: (zone: AdminZone) => void;
}

/**
 * The Create Zone dialog's form + its live drawing map preview, for
 * Zones.tsx (work queue item #2). Kept separate from useZonesList per "do
 * not create one giant unmaintainable hook" -- this is the create flow,
 * useZonesList is the list/selection/preview-map flow.
 */
export function useZoneForm({ onCreated }: UseZoneFormOptions) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"polygon" | "circle">("polygon");
  const [multiplier, setMultiplier] = useState("1.5");
  const [isActive, setIsActive] = useState(true);

  // Circle State
  const [centerLat, setCenterLat] = useState("");
  const [centerLng, setCenterLng] = useState("");
  const [radius, setRadius] = useState("1000"); // 1km default
  const [autoSurge, setAutoSurge] = useState(false);

  // Polygon State - starts empty so users can draw from scratch
  const [polyCoords, setPolyCoords] = useState("[]");

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Live Modal Preview Map State
  const [modalMapCenter, setModalMapCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [modalMapZoom] = useState(13);
  const [previewCircleCenter, setPreviewCircleCenter] = useState<LatLng | null>(null);
  const [previewPolygonPath, setPreviewPolygonPath] = useState<LatLng[]>([]);

  // Sync modal coordinates to live preview on change
  useEffect(() => {
    if (type === "circle") {
      const lat = parseFloat(centerLat);
      const lng = parseFloat(centerLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const centerObj = { lat, lng };
        setPreviewCircleCenter(centerObj);
        setModalMapCenter(centerObj);
      } else {
        setPreviewCircleCenter(null);
      }
    } else {
      try {
        const coords = JSON.parse(polyCoords);
        if (Array.isArray(coords) && coords.length > 0) {
          const path = coords.map(([lng, lat]: [number, number]) => ({
            lat: Number(lat),
            lng: Number(lng),
          }));
          setPreviewPolygonPath(path);
          // Only shift map center if path was just created or explicitly changed
          if (path.length > 0 && modalMapCenter.lat === DEFAULT_CENTER.lat && modalMapCenter.lng === DEFAULT_CENTER.lng) {
            setModalMapCenter(path[0]);
          }
        } else {
          setPreviewPolygonPath([]);
        }
      } catch {
        // Quietly catch JSON parsing errors during typing
      }
    }
  }, [centerLat, centerLng, polyCoords, type]);

  const createZoneMutation = useMutation({
    mutationFn: (newZone: NewZonePayload) => adminFetch<{ data: AdminZone }>("/zones", { method: "POST", body: JSON.stringify(newZone) }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "zones"] });
      toast.success("Zone created successfully");
      setIsAddOpen(false);

      if (res && res.data) {
        onCreated(res.data);
      }
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create zone");
    },
  });

  const resetForm = () => {
    setName("");
    setType("polygon");
    setMultiplier("1.5");
    setIsActive(true);
    setAutoSurge(false);
    setCenterLat("");
    setCenterLng("");
    setRadius("1000");
    setPolyCoords("[]");
    setPreviewCircleCenter(null);
    setPreviewPolygonPath([]);
    setModalMapCenter(DEFAULT_CENTER);

    // Advanced
    setDescription("");
    setSelectedServices([]);
    setStartTime("");
    setEndTime("");
    setShowAdvanced(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Zone name is required");

    const payload: NewZonePayload = {
      name,
      type,
      pricingMultiplier: parseFloat(multiplier),
      isActive,
      description: description || undefined,
      allowedServices: selectedServices.length > 0 ? selectedServices : undefined,
      autoSurgeEnabled: autoSurge,
    };

    if (startTime || endTime) {
      payload.activeHours = {
        start: startTime || "00:00",
        end: endTime || "23:59",
      };
    }

    if (type === "circle") {
      const lat = parseFloat(centerLat);
      const lng = parseFloat(centerLng);
      const rad = parseFloat(radius);

      if (isNaN(lat) || isNaN(lng)) {
        return toast.error("Center coordinates must be valid numbers");
      }
      if (isNaN(rad) || rad <= 0) {
        return toast.error("Radius must be a positive number");
      }

      payload.center = { coordinates: [lng, lat] };
      payload.radius = rad;
    } else {
      try {
        const coords = JSON.parse(polyCoords);
        if (!Array.isArray(coords) || coords.length < 3) {
          return toast.error("Polygon must contain at least 3 coordinates");
        }

        const first = coords[0];
        const last = coords[coords.length - 1];
        const isClosed = first[0] === last[0] && first[1] === last[1];
        const normalizedCoords = isClosed ? coords : [...coords, first];

        payload.boundary = { coordinates: [normalizedCoords] };
      } catch (err) {
        return toast.error(`Invalid coordinates format: ${(err as Error).message}`);
      }
    }

    createZoneMutation.mutate(payload);
  };

  // Smart Coordinate Insertion using segment proximity calculation to prevent overlapping polygon lines
  const handleModalMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng) return;

    if (type === "circle") {
      setCenterLat(lat.toFixed(6));
      setCenterLng(lng.toFixed(6));
      toast.info(`Set circle center to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } else {
      try {
        let current: [number, number][] = [];
        try {
          current = JSON.parse(polyCoords);
        } catch {
          current = [];
        }

        if (!Array.isArray(current)) current = [];

        const newCoord: [number, number] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];

        if (current.length < 3) {
          // 1. If we have less than 3 points, simply append the coordinates
          current.push(newCoord);

          // Once the third coordinate is added, automatically close the polygon loop
          if (current.length === 3) {
            current.push(current[0]);
          }
          toast.info(`Added node ${current.length >= 3 ? current.length - 1 : current.length}: [${lng.toFixed(4)}, ${lat.toFixed(4)}]`);
        } else {
          // 2. We have 3 or more points. Find the segment where this point fits best to prevent crossovers
          const first = current[0];
          const last = current[current.length - 1];
          const isClosed = first[0] === last[0] && first[1] === last[1];

          if (isClosed) {
            current.pop(); // Temp pop the closing node for cost checks
          }

          let bestIndex = current.length;
          let minCost = Infinity;

          // Build a loop path to evaluate cost of inserting into all segments including (last, first)
          const path = current.map(([ln, lt]) => ({ lat: lt, lng: ln }));
          path.push(path[0]); // Complete loop

          for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];

            const d1 = getDistanceInMeters(p1.lat, p1.lng, lat, lng);
            const d2 = getDistanceInMeters(p2.lat, p2.lng, lat, lng);
            const d12 = getDistanceInMeters(p1.lat, p1.lng, p2.lat, p2.lng);

            // Cost formula: Distance(p1, new) + Distance(new, p2) - Distance(p1, p2)
            const cost = d1 + d2 - d12;
            if (cost < minCost) {
              minCost = cost;
              bestIndex = i + 1; // Insert after node i
            }
          }

          // Insert at optimal position
          current.splice(bestIndex, 0, newCoord);

          // Re-close the polygon loop
          current.push(current[0]);
          toast.info(`Inserted node at segment position ${bestIndex}: [${lng.toFixed(4)}, ${lat.toFixed(4)}]`);
        }

        setPolyCoords(JSON.stringify(current));
      } catch {
        setPolyCoords(JSON.stringify([[Number(lng.toFixed(6)), Number(lat.toFixed(6))]]));
      }
    }
  };

  // Dragging vertex markers to change polygon coordinates visually
  const handleMarkerDragEnd = (index: number, e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (!lat || !lng) return;

    try {
      const current = JSON.parse(polyCoords);
      if (Array.isArray(current)) {
        current[index] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];

        // If we updated the first node, ensure the last closing node matches
        if (index === 0 && current.length >= 3) {
          current[current.length - 1] = current[0];
        }

        setPolyCoords(JSON.stringify(current));
        toast.success(`Moved node ${index + 1} to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      console.error("Failed updating marker position:", err);
    }
  };

  const handleUndoCoordinate = () => {
    try {
      const current = JSON.parse(polyCoords);
      if (!Array.isArray(current) || current.length === 0) {
        toast.info("No coordinates to undo");
        return;
      }

      // Remove closing node if present
      if (current.length >= 3) {
        const first = current[0];
        const last = current[current.length - 1];
        if (first[0] === last[0] && first[1] === last[1]) {
          current.pop();
        }
      }

      // Pop the last node
      const popped = current.pop();

      // Re-close the loop if we still have at least 3 nodes
      if (current.length >= 3) {
        current.push(current[0]);
      }

      setPolyCoords(JSON.stringify(current));
      if (popped) {
        toast.success(`Removed point: [${popped[0].toFixed(4)}, ${popped[1].toFixed(4)}]`);
      }
    } catch {
      toast.error("Failed to undo coordinate");
    }
  };

  const clearModalCoordinates = () => {
    if (type === "circle") {
      setCenterLat("");
      setCenterLng("");
    } else {
      setPolyCoords("[]");
    }
    toast.success("Coordinates cleared");
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]));
  };

  const handleTypeChange = (value: "polygon" | "circle") => {
    setType(value);
    if (value === "circle") {
      setPolyCoords("[]");
    } else {
      setCenterLat("");
      setCenterLng("");
    }
  };

  // Exclude duplicate/closing node marker to avoid overlapping rendering in polygon
  const getPolygonMarkers = () => {
    if (previewPolygonPath.length === 0) return [];
    const first = previewPolygonPath[0];
    const last = previewPolygonPath[previewPolygonPath.length - 1];
    if (previewPolygonPath.length >= 3 && first.lat === last.lat && first.lng === last.lng) {
      return previewPolygonPath.slice(0, -1);
    }
    return previewPolygonPath;
  };

  return {
    isAddOpen,
    setIsAddOpen,
    openCreateDialog,
    name,
    setName,
    type,
    handleTypeChange,
    multiplier,
    setMultiplier,
    isActive,
    setIsActive,
    centerLat,
    setCenterLat,
    centerLng,
    setCenterLng,
    radius,
    setRadius,
    autoSurge,
    setAutoSurge,
    polyCoords,
    setPolyCoords,
    showAdvanced,
    setShowAdvanced,
    description,
    setDescription,
    selectedServices,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    modalMapCenter,
    modalMapZoom,
    previewCircleCenter,
    previewPolygonPath,
    handleCreateZone,
    isCreating: createZoneMutation.isPending,
    handleModalMapClick,
    handleMarkerDragEnd,
    handleUndoCoordinate,
    clearModalCoordinates,
    toggleServiceSelection,
    getPolygonMarkers,
  };
}
