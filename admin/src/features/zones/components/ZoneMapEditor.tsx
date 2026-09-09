import { GoogleMap, Polygon as MapPolygon, Circle as MapCircle, Marker } from "@react-google-maps/api";
import { Map as MapIcon, RefreshCw } from "lucide-react";
import type { LatLng } from "../types";

interface ZoneMapEditorProps {
  isLoaded: boolean;
  type: "polygon" | "circle";
  modalMapCenter: LatLng;
  modalMapZoom: number;
  previewCircleCenter: LatLng | null;
  previewPolygonPath: LatLng[];
  radius: string;
  polygonMarkers: LatLng[];
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onCircleCenterChange: (lat: string, lng: string) => void;
  onPolygonMarkerDragEnd: (index: number, e: google.maps.MapMouseEvent) => void;
}

/** The Create Zone dialog's interactive drawing map: click to add vertices/set the circle center, drag markers to adjust. */
export function ZoneMapEditor({
  isLoaded,
  type,
  modalMapCenter,
  modalMapZoom,
  previewCircleCenter,
  previewPolygonPath,
  radius,
  polygonMarkers,
  onMapClick,
  onCircleCenterChange,
  onPolygonMarkerDragEnd,
}: ZoneMapEditorProps) {
  return (
    <div className="h-[350px] md:h-auto bg-muted/40 relative flex flex-col justify-end">
      <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border shadow-md text-[11px] z-10 space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1">
          <MapIcon className="h-3.5 w-3.5 text-primary" /> Live Drawing Engine
        </p>
        <p className="text-muted-foreground leading-normal">
          {type === "circle"
            ? "Click anywhere on the map to set the circular center point. Drag the blue marker to adjust center location."
            : "Click points sequentially on the map to outline the polygon geofence shape. Drag node markers (1, 2, 3...) to adjust vertices live."}
        </p>
      </div>

      {!isLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mb-2 text-primary" />
          <p className="text-xs">Loading Live Preview Map...</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={modalMapCenter}
          zoom={modalMapZoom}
          onClick={onMapClick}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {type === "circle" && previewCircleCenter && (
            <>
              <Marker
                position={previewCircleCenter}
                draggable={true}
                onDragEnd={(e) => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) {
                    onCircleCenterChange(lat.toFixed(6), lng.toFixed(6));
                  }
                }}
              />
              <MapCircle
                center={previewCircleCenter}
                radius={Number(radius) || 1000}
                options={{
                  fillColor: "#3b82f6",
                  fillOpacity: 0.25,
                  strokeColor: "#2563eb",
                  strokeOpacity: 0.7,
                  strokeWeight: 2,
                  clickable: false,
                  editable: false,
                }}
              />
            </>
          )}

          {type === "polygon" && previewPolygonPath.length > 0 && (
            <>
              {polygonMarkers.map((pt, i) => (
                <Marker
                  key={i}
                  position={pt}
                  draggable={true}
                  onDragEnd={(e) => onPolygonMarkerDragEnd(i, e)}
                  label={{
                    text: (i + 1).toString(),
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
              ))}
              <MapPolygon
                paths={previewPolygonPath}
                options={{
                  fillColor: "#8b5cf6",
                  fillOpacity: 0.25,
                  strokeColor: "#7c3aed",
                  strokeOpacity: 0.7,
                  strokeWeight: 2.5,
                  clickable: false,
                  editable: false,
                }}
              />
            </>
          )}
        </GoogleMap>
      )}

      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border shadow-md text-[10px] font-semibold text-muted-foreground z-10 uppercase tracking-wider">
        Interactive Drawing Active
      </div>
    </div>
  );
}
