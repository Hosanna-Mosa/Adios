import { CancelRideSheet } from "@/features/ride/components/CancelRideSheet";
import { View, StyleSheet } from "react-native";
import { FindingDriverSheet } from "@/features/ride/components/FindingDriverSheet";
import { MapBackground } from "@/components/MapBackground";
import { FindingDriverRadarWrap } from "@/features/ride/components/FindingDriverRadarWrap";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { FindingDriverBody } from "@/features/ride/components/FindingDriverBody";
import { useFindingDriver } from "@/features/ride/useFindingDriver";
import { FindingDriverBackButton } from "@/features/ride/components/FindingDriverBackButton";

export default function FindingDriverScreen() {
  const {
  insets, dateTimeStr, tokens, accent, styles, bookingConfirmed, confirmedDriver, stops,
  onlineDrivers, orderSummary, ring1Style, ring2Style, spinStyle, showCancelSheet,
  setShowCancelSheet, cancelReason, setCancelReason, handleCancel, pickupStop, dropStop, tierLabel,
  CANCEL_REASONS
  } = useFindingDriver();

  if (bookingConfirmed && confirmedDriver) {
    return (
      <ScreenShell style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <FindingDriverBody
          confirmedDriver={confirmedDriver}
          dateTimeStr={dateTimeStr}
          styles={styles}
        />
      </ScreenShell>
    );
  }

  return (
    <View style={styles.root}>
      <MapBackground stops={stops} driverMarkers={onlineDrivers} style={StyleSheet.absoluteFill} />

      <FindingDriverRadarWrap
        ring1Style={ring1Style}
        ring2Style={ring2Style}
        styles={styles}
      />

      <FindingDriverBackButton
        insets={insets}
        onPress={() => setShowCancelSheet(true)}
        styles={styles}
        tokens={tokens}
      />

      <FindingDriverSheet
        dropStop={dropStop}
        orderSummary={orderSummary}
        pickupStop={pickupStop}
        setShowCancelSheet={setShowCancelSheet}
        spinStyle={spinStyle}
        styles={styles}
        tierLabel={tierLabel}
      />

      <CancelRideSheet
        CANCEL_REASONS={CANCEL_REASONS}
        accent={accent}
        cancelReason={cancelReason}
        handleCancel={handleCancel}
        insets={insets}
        setCancelReason={setCancelReason}
        setShowCancelSheet={setShowCancelSheet}
        showCancelSheet={showCancelSheet}
        styles={styles}
      />
    </View>
  );
}
