import { LIGHT_WARM_MAP_STYLE } from "@/constants/mapStyle";
import { MapPickerBottomPanel } from "@/features/delivery/components/MapPickerBottomPanel";
import { MapPickerMapContainer } from "@/features/delivery/components/MapPickerMapContainer";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useMapPicker } from "@/features/delivery/useMapPicker";

export default function MapPickerScreen() {
  const {
  insets, tokens, accent, styles, step, region, address, loading, recentering, mapRef, latLabel,
  lngLabel, handleRegionChangeComplete, handleUseCurrentLocation, handleConfirm
  } = useMapPicker();

  return (
    <ScreenShell>
      <MapPickerMapContainer
        LIGHT_WARM_MAP_STYLE={LIGHT_WARM_MAP_STYLE}
        handleRegionChangeComplete={handleRegionChangeComplete}
        handleUseCurrentLocation={handleUseCurrentLocation}
        insets={insets}
        mapRef={mapRef}
        recentering={recentering}
        region={region}
        styles={styles}
        tokens={tokens}
      />

      <MapPickerBottomPanel
        accent={accent}
        address={address}
        handleConfirm={handleConfirm}
        latLabel={latLabel}
        lngLabel={lngLabel}
        loading={loading}
        step={step}
        styles={styles}
      />
    </ScreenShell>
  );
}
