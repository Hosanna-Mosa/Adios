import MapView, { PROVIDER_GOOGLE } from "@/components/maps";
import { useTranslation } from "react-i18next";
import { PickupConfirmPanel } from "@/features/ride/components/PickupConfirmPanel";
import { PickupConfirmMapArea } from "@/features/ride/components/PickupConfirmMapArea";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { usePickupConfirmation } from "@/features/ride/usePickupConfirmation";

export default function PickupConfirmationScreen() {
  const { t } = useTranslation();
  const {
  insets, tokens, accent, styles, mapRef, params, pickupCoords, confirmedPickup, estimate,
  loadingEstimate, recenter, updatePickup, useCurrentLocation
  } = usePickupConfirmation();

  return (
    <ScreenShell>
      <PickupConfirmMapArea
        MapView={MapView}
        PROVIDER_GOOGLE={PROVIDER_GOOGLE}
        pickupCoords={pickupCoords}
        accent={accent}
        insets={insets}
        mapRef={mapRef}
        styles={styles}
        tokens={tokens}
        useCurrentLocation={useCurrentLocation}
      />

      <PickupConfirmPanel
        firstLine={(value?: string) => firstLine(value, t("app.ride.pickupPointFallback"))}
        confirmedPickup={confirmedPickup}
        estimate={estimate}
        loadingEstimate={loadingEstimate}
        params={params}
        recenter={recenter}
        styles={styles}
        tokens={tokens}
        updatePickup={updatePickup}
      />
    </ScreenShell>
  );
}

const firstLine = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  return value.split(",")[0]?.trim() || value;
};
