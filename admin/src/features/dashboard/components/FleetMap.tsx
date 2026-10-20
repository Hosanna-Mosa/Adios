import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";

interface FleetDriver {
  id: string;
  name: string;
  vehicleType: string | null;
  busy: boolean;
  lat: number;
  lng: number;
}

interface Fleet {
  drivers: FleetDriver[];
  counts: { online: number; onJob: number; free: number; searching: number };
}

const DEFAULT_CENTER = { lat: 16.8, lng: 81.5 };
const dot = (color: string) => ({
  path: 0, // google.maps.SymbolPath.CIRCLE
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  scale: 8,
});

/** Live fleet map: every online driver where they last reported, green when free and orange on a job. Refreshes every 15 seconds. */
export function FleetMap() {
  const { t } = useTranslation();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA",
  });
  const { data, isLoading } = useQuery({ queryKey: ["admin", "fleet"], queryFn: () => adminFetch<Fleet>("/admin/fleet"), refetchInterval: 15_000 });

  const center = useMemo(() => {
    const drivers = data?.drivers ?? [];
    if (!drivers.length) return DEFAULT_CENTER;
    return { lat: drivers.reduce((s, d) => s + d.lat, 0) / drivers.length, lng: drivers.reduce((s, d) => s + d.lng, 0) / drivers.length };
  }, [data?.drivers]);

  const counts = data?.counts;
  return (
    <div className="section-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {t("dashboard.liveFleet", "Live fleet")}
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />{t("dashboard.fleetFree", "Free")} {counts?.free ?? 0}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />{t("dashboard.fleetOnJob", "On a job")} {counts?.onJob ?? 0}</span>
          <span>{t("dashboard.fleetSearching", "Orders searching for a driver")}: {counts?.searching ?? 0}</span>
        </div>
      </div>
      <div className="h-[380px] w-full bg-muted/30 relative">
        {!isLoaded || isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={data?.drivers.length ? 12 : 8} options={{ mapTypeControl: false, streetViewControl: false }}>
            {(data?.drivers ?? []).map((driver) => (
              <Marker
                key={driver.id}
                position={{ lat: driver.lat, lng: driver.lng }}
                title={`${driver.name}${driver.vehicleType ? ` · ${driver.vehicleType}` : ""}${driver.busy ? " · on a job" : ""}`}
                icon={dot(driver.busy ? "#f97316" : "#22c55e")}
              />
            ))}
          </GoogleMap>
        )}
        {isLoaded && !isLoading && data?.drivers.length === 0 && (
          <p className="absolute inset-x-0 bottom-4 text-center text-xs font-semibold text-muted-foreground">{t("dashboard.fleetNone", "No driver is online and sharing a location right now.")}</p>
        )}
      </div>
    </div>
  );
}
