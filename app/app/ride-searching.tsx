import { View } from "react-native";
import { SearchingMap } from "@/features/ride/components/SearchingMap";
import { SearchingPanel } from "@/features/ride/components/SearchingPanel";
import { BookAgainOverlay } from "@/features/ride/components/BookAgainOverlay";
import { useRideSearching } from "@/features/ride/useRideSearching";

export default function RideSearchingScreen() {
  const {
  colors, styles, mapRef, progressBarStyle, dotStyle, params, tripDetailsVisible,
  setTripDetailsVisible, cancelReasonVisible, setCancelReasonVisible, cancelConfirmVisible,
  selectedCancelReason, onlineDrivers, pickupCoords, dropCoords, fare, pickupTitle, dropTitle,
  cancelUsesDrop, cancelLocationTitle, cancelLocationAddress, cancelLocationLabel, fitTripMarkers,
  showTripDetails, showCancelReasons, selectCancelReason, keepSearching, cancelRide
  } = useRideSearching();

  return (
    <View style={styles.root}>
      <SearchingMap
        VEHICLE_AUTO_3D={VEHICLE_AUTO_3D}
        VEHICLE_BIKE_3D={VEHICLE_BIKE_3D}
        VEHICLE_CAB_3D={VEHICLE_CAB_3D}
        colors={colors}
        dropCoords={dropCoords}
        fitTripMarkers={fitTripMarkers}
        mapRef={mapRef}
        onlineDrivers={onlineDrivers}
        pickupCoords={pickupCoords}
        styles={styles}
      />

      <SearchingPanel
        colors={colors}
        dotStyle={dotStyle}
        fare={fare}
        progressBarStyle={progressBarStyle}
        showTripDetails={showTripDetails}
        styles={styles}
      />

      {tripDetailsVisible && (
        <BookAgainOverlay
          CANCEL_REASONS={CANCEL_REASONS}
          cancelConfirmVisible={cancelConfirmVisible}
          cancelLocationAddress={cancelLocationAddress}
          cancelLocationLabel={cancelLocationLabel}
          cancelLocationTitle={cancelLocationTitle}
          cancelReasonVisible={cancelReasonVisible}
          cancelRide={cancelRide}
          cancelUsesDrop={cancelUsesDrop}
          colors={colors}
          dropTitle={dropTitle}
          fare={fare}
          keepSearching={keepSearching}
          params={params}
          pickupTitle={pickupTitle}
          selectCancelReason={selectCancelReason}
          selectedCancelReason={selectedCancelReason}
          setCancelReasonVisible={setCancelReasonVisible}
          setTripDetailsVisible={setTripDetailsVisible}
          showCancelReasons={showCancelReasons}
          styles={styles}
        />
      )}
    </View>
  );
}

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");
const VEHICLE_CAB_3D = require("@/assets/images/services/cab.png");

const CANCEL_REASONS = [
  "Selected Wrong Pickup Location",
  "Selected Wrong Drop Location",
  "Booked by mistake",
  "Selected different service/vehicle",
  "Taking too long to confirm the ride",
  "Got a ride elsewhere",
  "Others",
];
