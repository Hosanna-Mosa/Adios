import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Truck as TruckIcon, Plus, Minus, Layers } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { MapMarker, OrderDriver } from "../orderDetailTypes";

interface OrderRouteMapProps {
  isLoaded: boolean;
  mapCenter: { lat: number; lng: number };
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  mapType: "roadmap" | "satellite";
  setMapType: Dispatch<SetStateAction<"roadmap" | "satellite">>;
  mapMarkers: MapMarker[];
  polylinePath: { lat: number; lng: number }[];
  driver?: OrderDriver;
}

/** The right-panel route map (Google Map + zoom/type controls + live-tracking card) on OrderDetail.tsx. */
export function OrderRouteMap({ isLoaded, mapCenter, zoom, setZoom, mapType, setMapType, mapMarkers, polylinePath, driver }: OrderRouteMapProps) {
  return (
    <div className="relative h-full w-full flex-1 min-h-[400px]">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%", minHeight: "100%" }}
          center={mapCenter}
          zoom={zoom}
          mapTypeId={mapType}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {mapMarkers.map((m, i) => (
            <Marker
              key={i}
              position={{ lat: m.lat, lng: m.lng }}
              label={m.label}
              title={`${m.type}: ${m.address}`}
            />
          ))}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              options={{
                strokeColor: "hsl(185, 80%, 28%)",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <div className="bg-gradient-to-br from-primary/10 to-primary/20 absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Loading Route Map...
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom(prev => Math.min(20, prev + 1))}
          className="h-10 w-10 bg-card rounded-lg shadow-sm flex items-center justify-center hover:bg-muted/50 transition-colors"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(1, prev - 1))}
          className="h-10 w-10 bg-card rounded-lg shadow-sm flex items-center justify-center hover:bg-muted/50 transition-colors"
        >
          <Minus className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={() => setMapType(prev => prev === "roadmap" ? "satellite" : "roadmap")}
          className="h-10 w-10 bg-card rounded-lg shadow-sm flex items-center justify-center hover:bg-muted/50 mt-4 transition-colors"
        >
          <Layers className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Vehicle Tracker */}
      {driver && (
        <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur rounded-xl shadow-lg p-4 z-10">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-primary mb-2">Live Tracking</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <TruckIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{driver.user?.name || "Driver"}</p>
                <p className="text-xs text-muted-foreground">Vehicle: {driver.vehicleNumber || "VAN"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">Active <span className="text-sm font-normal text-muted-foreground">GPS</span></p>
              <p className="text-xs text-muted-foreground">Steady Velocity</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
