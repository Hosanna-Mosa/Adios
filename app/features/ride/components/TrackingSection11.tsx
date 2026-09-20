import { Dimensions, Linking, ScrollView, StyleSheet, View } from "react-native";
import { MapBackground } from "@/components/MapBackground";
import { BottomSheet } from "@/components/BottomSheet";
import { TrackingFooterBtnOutline } from "@/features/ride/components/TrackingFooterBtnOutline";
import { TrackingFooterBtnOutline2 } from "@/features/ride/components/TrackingFooterBtnOutline2";
import { TrackingFooterBtnOutline3 } from "@/features/ride/components/TrackingFooterBtnOutline3";
import { TrackingFooterBtnOutline4 } from "@/features/ride/components/TrackingFooterBtnOutline4";
import { TrackingAddrCard } from "@/features/ride/components/TrackingAddrCard";
import { TrackingHelperUpdate } from "@/features/ride/components/TrackingHelperUpdate";
import { TrackingPinCard } from "@/features/ride/components/TrackingPinCard";
import { TrackingPinCard2 } from "@/features/ride/components/TrackingPinCard2";
import { TrackingPinCard3 } from "@/features/ride/components/TrackingPinCard3";
import { TrackingPartnerRow } from "@/features/ride/components/TrackingPartnerRow";
import { TrackingTimelineBlock } from "@/features/ride/components/TrackingTimelineBlock";
import { TrackingFindingWrap } from "@/features/ride/components/TrackingFindingWrap";
import { TrackingTopBar } from "@/features/ride/components/TrackingTopBar";
import { TripDetailsModal } from "@/features/ride/components/TripDetailsModal";

// Markup moved out of tracking.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

import type { Props } from "./TrackingSection11.props";
import { TrackingSection11Section2 } from "./TrackingSection11Section2";

export function TrackingSection11(props: Props) {
  const {
  accent, bannerText, driver, driverLocation, eta, insets, mapRef, radius, route, status, stops,
  styles, tokens, userLocCoords
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

    <TrackingSection11Section2 {...props} />
    </>
  );
}
