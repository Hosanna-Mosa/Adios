import Animated from "react-native-reanimated";
import { RideMapPanel } from "@/features/ride/components/RideMapPanel";
import { TripChooserSheet } from "@/features/ride/components/TripChooserSheet";
import { SchedulePickerSheet } from "@/features/ride/components/SchedulePickerSheet";
import { fadeInUp } from "@/motion/presets";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { RideConfirmBody } from "@/features/ride/components/RideConfirmBody";
import { RideConfirmFooterActions } from "@/features/ride/components/RideConfirmFooterActions";
import { useRideConfirmation } from "@/features/ride/useRideConfirmation";
import { BackToHomeButton } from "@/features/ride/components/BackToHomeButton";

export default function RideConfirmationScreen() {
  const {
  insets, params, tokens, accent, styles, selectedTier, setSelectedTier, tierFares, loadingFares,
  booking, showDatePicker, setShowDatePicker, reserveDate, setReserveDate, reserveHour,
  setReserveHour, reserveMinute, setReserveMinute, reserveAmpm, setReserveAmpm,
  confirmedReservation, dateOptions, pickupCoords, dropCoords, userLocation, nearbyDrivers,
  setMapReady, routeCoordinates, mapRef, validStops, pickupIsValid, dropIsValid, tripCoordinates,
  fitTripToMap, initialRegion, getDisplayName, handleShareRoute, handleAddStopFromMap,
  handleRecenter, placeOrder, ENABLED_TIERS
  } = useRideConfirmation();

  if (confirmedReservation) {
    return (
      <ScreenShell>
        <RideConfirmBody
          confirmedReservation={confirmedReservation}
          getDisplayName={getDisplayName}
          insets={insets}
          styles={styles}
        />

        <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]} entering={fadeInUp(160)}>
          <RideConfirmFooterActions
            styles={styles}
          />
          <BackToHomeButton styles={styles} />
        </Animated.View>
      </ScreenShell>
    );
  }

  const selectedFare = tierFares[selectedTier];

  return (
    <ScreenShell>
      <RideMapPanel
        VEHICLE_AUTO_3D={VEHICLE_AUTO_3D}
        VEHICLE_BIKE_3D={VEHICLE_BIKE_3D}
        GOOGLE_MAPS_APIKEY={GOOGLE_MAPS_APIKEY}
        dropCoords={dropCoords}
        dropIsValid={dropIsValid}
        fitTripToMap={fitTripToMap}
        getDisplayName={getDisplayName}
        handleAddStopFromMap={handleAddStopFromMap}
        handleRecenter={handleRecenter}
        handleShareRoute={handleShareRoute}
        initialRegion={initialRegion}
        insets={insets}
        mapRef={mapRef}
        nearbyDrivers={nearbyDrivers}
        params={params}
        pickupCoords={pickupCoords}
        pickupIsValid={pickupIsValid}
        routeCoordinates={routeCoordinates}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setMapReady={setMapReady}
        styles={styles}
        tokens={tokens}
        tripCoordinates={tripCoordinates}
        userLocation={userLocation}
        validStops={validStops}
      />

      <TripChooserSheet
        ENABLED_TIERS={ENABLED_TIERS}
        accent={accent}
        booking={booking}
        handleAddStopFromMap={handleAddStopFromMap}
        insets={insets}
        loadingFares={loadingFares}
        placeOrder={placeOrder}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setSelectedTier={setSelectedTier}
        setShowDatePicker={setShowDatePicker}
        styles={styles}
        tierFares={tierFares}
        tokens={tokens}
      />

      <SchedulePickerSheet
        ENABLED_TIERS={ENABLED_TIERS}
        accent={accent}
        booking={booking}
        dateOptions={dateOptions}
        insets={insets}
        placeOrder={placeOrder}
        reserveAmpm={reserveAmpm}
        reserveDate={reserveDate}
        reserveHour={reserveHour}
        reserveMinute={reserveMinute}
        selectedFare={selectedFare}
        selectedTier={selectedTier}
        setReserveAmpm={setReserveAmpm}
        setReserveDate={setReserveDate}
        setReserveHour={setReserveHour}
        setReserveMinute={setReserveMinute}
        setShowDatePicker={setShowDatePicker}
        showDatePicker={showDatePicker}
        styles={styles}
      />
    </ScreenShell>
  );
}

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const VEHICLE_BIKE_3D = require("@/assets/images/services/scooter_blue_top_view_2.png");
const VEHICLE_AUTO_3D = require("@/assets/images/services/auto_top_view.png");
