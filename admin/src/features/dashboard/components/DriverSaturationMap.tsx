import { GoogleMap, Marker } from "@react-google-maps/api";
import { FadeIn } from "@/components/motion/FadeIn";

interface DriverSaturationMapProps {
  isLoaded: boolean;
}

const DOWNTOWN = { lat: 17.0005, lng: 81.804 };
const INDUSTRIAL_EAST = { lat: 17.0205, lng: 81.824 };

/** The "Driver Saturation" map panel with a density legend overlay. */
export function DriverSaturationMap({ isLoaded }: DriverSaturationMapProps) {
  return (
    <FadeIn delay={0.05} className="col-span-2 section-card overflow-hidden h-[300px] relative">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={DOWNTOWN}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={DOWNTOWN} title="Downtown - High Density" />
          <Marker position={INDUSTRIAL_EAST} title="Industrial East - Optimal" />
        </GoogleMap>
      ) : (
        <div className="bg-gradient-to-br from-primary/10 to-primary/20 absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Loading Saturation Map...</div>
      )}

      <div className="absolute top-6 left-6 bg-card/95 backdrop-blur p-4 rounded-xl shadow-sm max-w-[240px] z-10">
        <h4 className="font-semibold text-foreground text-sm">Driver Saturation</h4>
        <p className="text-xs text-muted-foreground mt-1">Live heatmap of metropolitan logistics flow.</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-foreground">Downtown</span>
            <span className="text-[11px] font-semibold text-destructive">High Density</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full">
            <div className="h-full w-[85%] bg-primary rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-foreground">Industrial East</span>
            <span className="text-[11px] font-semibold text-success">Optimal</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full">
            <div className="h-full w-[45%] bg-primary rounded-full" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-2 rounded-lg z-10 shadow">
        <div className="flex -space-x-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-card" />
          <div className="h-6 w-6 rounded-full bg-primary/30 border-2 border-card" />
          <div className="h-6 w-6 rounded-full bg-primary/40 border-2 border-card" />
        </div>
        <span className="text-xs font-medium text-foreground">+12 Active Now</span>
      </div>
    </FadeIn>
  );
}
