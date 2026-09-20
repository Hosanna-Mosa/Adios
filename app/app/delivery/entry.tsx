import { StyleSheet } from "react-native";
import { MapBackground } from "@/components/MapBackground";
import { DeliveryEntrySheet } from "@/features/delivery/components/DeliveryEntrySheet";
import { DeliveryEntryHeader } from "@/features/delivery/components/DeliveryEntryHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useDeliveryEntry } from "@/features/delivery/useDeliveryEntry";

export default function DeliveryEntryScreen() {
  const {
  stops, route, price, currentLocation, removeStop, insets, tokens, accent, styles, isCalculating,
  isLocating, mapRef, handleLocationUpdate, handleRecenter, handleStopPress, handleReview
  } = useDeliveryEntry();

  return (
    <ScreenShell>
      <MapBackground ref={mapRef} stops={stops} polyline={route?.polyline} onLocationUpdate={handleLocationUpdate} style={StyleSheet.absoluteFill} />

      <DeliveryEntryHeader
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <DeliveryEntrySheet
        accent={accent}
        currentLocation={currentLocation}
        handleRecenter={handleRecenter}
        handleReview={handleReview}
        handleStopPress={handleStopPress}
        insets={insets}
        isCalculating={isCalculating}
        isLocating={isLocating}
        price={price}
        removeStop={removeStop}
        route={route}
        stops={stops}
        styles={styles}
      />
    </ScreenShell>
  );
}
