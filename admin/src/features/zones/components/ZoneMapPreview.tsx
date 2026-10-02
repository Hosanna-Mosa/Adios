import { RefObject } from "react";
import { GoogleMap, Polygon as MapPolygon, Circle as MapCircle, Marker } from "@react-google-maps/api";
import { Map as MapIcon, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminZone, LatLng } from "../types";

interface ZoneMapPreviewProps {
  isLoaded: boolean;
  selectedZone: AdminZone | null;
  mapCenter: LatLng;
  mapZoom: number;
  mapRef: RefObject<google.maps.Map | null>;
  getGoogleCoords: (zone: AdminZone) => LatLng[];
  getGoogleCenter: (zone: AdminZone) => LatLng;
  getZoneColors: (multiplier: number) => { fill: string; stroke: string };
  onEditZone: (zone: AdminZone) => void;
}

/** Read-only "Live Zone Geofence" panel: previews the selected zone's shape on the map. */
export function ZoneMapPreview({ isLoaded, selectedZone, mapCenter, mapZoom, mapRef, getGoogleCoords, getGoogleCenter, getZoneColors, onEditZone }: ZoneMapPreviewProps) {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-1 section-card flex flex-col overflow-hidden h-[500px] lg:h-auto min-h-[450px]">
      <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
        <div>
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <MapIcon className="h-4.5 w-4.5 text-primary" /> {t("zones.liveZoneGeofence")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{selectedZone ? t("zones.previewingColon", { name: selectedZone.name, defaultValue: "Previewing: {{name}}" }) : t("zones.selectZoneToPreview")}</p>
        </div>
        {selectedZone && <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">{selectedZone.pricingMultiplier}x</span>}
      </div>

      <div className="flex-1 w-full h-full bg-muted/40 relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mb-2 text-primary" />
            <p className="text-xs font-medium">{t("zones.loadingGoogleMapEngine")}</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {selectedZone && selectedZone.type === "circle" && selectedZone.center?.coordinates && (
              <>
                <Marker position={getGoogleCenter(selectedZone)} />
                <MapCircle
                  center={getGoogleCenter(selectedZone)}
                  radius={Number(selectedZone.radius)}
                  options={{
                    fillColor: getZoneColors(selectedZone.pricingMultiplier).fill,
                    fillOpacity: 0.35,
                    strokeColor: getZoneColors(selectedZone.pricingMultiplier).stroke,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    clickable: false,
                    editable: false,
                    zIndex: 1,
                  }}
                />
              </>
            )}

            {selectedZone && selectedZone.type === "polygon" && selectedZone.boundary?.coordinates?.[0] && (
              <MapPolygon
                paths={getGoogleCoords(selectedZone)}
                options={{
                  fillColor: getZoneColors(selectedZone.pricingMultiplier).fill,
                  fillOpacity: 0.35,
                  strokeColor: getZoneColors(selectedZone.pricingMultiplier).stroke,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: false,
                  editable: false,
                  zIndex: 1,
                }}
              />
            )}
          </GoogleMap>
        )}

        {/* Selected zone detail — where the "View" action lands */}
        {selectedZone && (
          <div className="absolute top-4 left-4 right-4 bg-background/95 backdrop-blur-sm p-3.5 rounded-lg border border-border shadow-md z-10 max-w-[320px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{selectedZone.name}</p>
                {selectedZone.description && <p className="text-[11px] text-muted-foreground mt-0.5">{selectedZone.description}</p>}
              </div>
              <span
                className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedZone.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedZone.isActive ? t("zones.active") : t("zones.inactive")}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 text-[11px]">
              <div>
                <dt className="text-muted-foreground">{t("zones.typeLabel")}</dt>
                <dd className="font-semibold text-foreground capitalize">{selectedZone.type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("zones.surge")}</dt>
                <dd className="font-semibold text-foreground">{selectedZone.pricingMultiplier}x</dd>
              </div>
              {selectedZone.type === "circle" ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">{t("zones.radius")}</dt>
                    <dd className="font-semibold text-foreground">{(Number(selectedZone.radius || 0) / 1000).toFixed(2)} km</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("zones.centre")}</dt>
                    <dd className="font-semibold text-foreground tabular-nums">
                      {selectedZone.center?.coordinates
                        ? `${Number(selectedZone.center.coordinates[1]).toFixed(4)}, ${Number(selectedZone.center.coordinates[0]).toFixed(4)}`
                        : "—"}
                    </dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt className="text-muted-foreground">{t("zones.boundary")}</dt>
                  <dd className="font-semibold text-foreground">
                    {t("zones.nPoints", { count: selectedZone.boundary?.coordinates?.[0]?.length || 0, defaultValue: "{{count}} points" })}
                  </dd>
                </div>
              )}
            </dl>

            <button
              onClick={() => onEditZone(selectedZone)}
              className="mt-3 w-full py-1.5 border border-border rounded-md text-[11px] font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              {t("zones.editThisZone")}
            </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-md text-[10px] space-y-1.5 z-10">
          <p className="font-semibold text-foreground uppercase tracking-wider mb-1">{t("zones.surgeLegend")}</p>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-red-500/40 border border-red-500" />
            <span className="text-muted-foreground font-medium">{t("zones.criticalGte2x")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-orange-500/40 border border-orange-500" />
            <span className="text-muted-foreground font-medium">{t("zones.high15to19x")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-yellow-500/40 border border-yellow-500" />
            <span className="text-muted-foreground font-medium">{t("zones.moderate11to14x")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-indigo-500/40 border border-indigo-500" />
            <span className="text-muted-foreground font-medium">{t("zones.standard10x")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
