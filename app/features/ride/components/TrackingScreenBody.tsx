import { Dimensions, Linking, ScrollView, StyleSheet, View } from "react-native";
import { MapBackground } from "@/components/MapBackground";
import { BottomSheet } from "@/components/BottomSheet";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TrackingTopBar } from "@/features/ride/components/TrackingTopBar";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";

// Markup moved out of tracking.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

import type { Props } from "./TrackingScreenBody.props";
import { TrackingBottomSheet } from "./TrackingBottomSheet";

export function TrackingScreenBody(props: Props) {
  const {
  accent, bannerText, driver, driverLocation, eta, insets, mapRef, radius, route, status, stops,
  styles, tokens, userLocCoords, outletOrder, rideOrder
  } = props;
  return (
    <>
    <MapBackground
      ref={mapRef}
      stops={stops}
      polyline={["en_route_delivery", "arrived_delivery"].includes(status) ? route?.polyline : undefined}
      driverLocation={driverLocation}
      driverVehicleType={driver?.vehicle && driver.vehicle !== "unknown" ? driver.vehicle : undefined}
      userLocation={userLocCoords}
      outletOrder={outletOrder}
      rideOrder={rideOrder}
      radiusCenter={stops?.[0]?.lat !== undefined && stops?.[0]?.lng !== undefined ? { lat: stops[0].lat, lng: stops[0].lng } : null}
      radiusMeters={radius ? radius * 1000 : undefined}
      style={StyleSheet.absoluteFill}
    />

    <TrackingTopBar
      bannerText={bannerText}
      accent={accent}
      eta={eta}
      insets={insets}
      status={status}
      styles={styles}
      tokens={tokens}
    />

    <TrackingBottomSheet {...props} />
    </>
  );
}
