import { CancelRideSheet } from "@/features/ride/components/CancelRideSheet";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { FindingDriverSheet } from "@/features/ride/components/FindingDriverSheet";
import { MapBackground } from "@/components/MapBackground";
import { FindingDriverRadarWrap } from "@/features/ride/components/FindingDriverRadarWrap";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { FindingDriverBody } from "@/features/ride/components/FindingDriverBody";
import { useFindingDriver } from "@/features/ride/useFindingDriver";

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

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => setShowCancelSheet(true)}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>

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
