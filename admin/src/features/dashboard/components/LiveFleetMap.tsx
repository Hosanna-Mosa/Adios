import { GoogleMap, Marker } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";

interface LiveFleetMapProps {
  isLoaded: boolean;
}

const HUB_CENTER = { lat: 17.0005, lng: 81.804 };
const DRIVER_MARKER = { lat: 17.0105, lng: 81.814 };

/** The "Live Fleet Positioning" map panel. */
export function LiveFleetMap({ isLoaded }: LiveFleetMapProps) {
  const { t } = useTranslation();
  return (
    <FadeIn className="col-span-2 section-card overflow-hidden h-[240px] relative">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={HUB_CENTER}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={HUB_CENTER} title="Downtown Hub Center" />
          <Marker position={DRIVER_MARKER} title="Active Driver: Marcus" />
        </GoogleMap>
      ) : (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">{t("dashboard.loadingFleetMap")}</div>
      )}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full z-10 shadow">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
        <span className="text-xs font-medium text-foreground">{t("dashboard.liveFleetPositioning")}</span>
      </div>
      <div className="absolute bottom-4 left-4 bg-foreground/80 text-primary-foreground px-4 py-2 rounded-lg z-10">
        <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">{t("dashboard.liveTracking")}</p>
        <p className="text-sm font-semibold">Downtown Hub</p>
      </div>
    </FadeIn>
  );
}
