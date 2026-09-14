import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  currentOrderId: any;
  insets: any;
  pickupLabel: any;
  setTripModalVisible: any;
  stops: any;
  styles: any;
  tokens: any;
  totalPrice: any;
}

export function TrackingModalOverlay({
  accent,
  currentOrderId,
  insets,
  pickupLabel,
  setTripModalVisible,
  stops,
  styles,
  tokens,
  totalPrice,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setTripModalVisible(false)} />
      <View style={styles.modalContent}>
        <View style={styles.sheetHandle} />
        <Text style={styles.modalTitle}>{t("app.ride.orderDetails")}</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16, marginBottom: 20 }}>
          <View style={styles.addrRail}>
            <View style={[styles.addrDot, { borderColor: accent.accent }]} />
            <View style={styles.addrLine} />
            <View style={[styles.addrDot, { backgroundColor: tokens.text, borderWidth: 0 }]} />
          </View>
          <View style={{ flex: 1, gap: 20 }}>
            <View>
              <Text style={styles.addrLabel}>PICKUP</Text>
              <Text style={[styles.addrText, { marginTop: 2 }]}>{pickupLabel}</Text>
            </View>
            <View>
              <Text style={styles.addrLabel}>DROP-OFF</Text>
              <Text style={[styles.addrText, { marginTop: 2 }]}>{stops?.[stops.length - 1]?.address || "—"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.modalOrderIdRow}>
          <Text style={styles.addrLabel}>ORDER ID</Text>
          <Text style={styles.modalOrderIdValue}>{currentOrderId?.substring(0, 8).toUpperCase()}</Text>
        </View>
        {totalPrice != null && (
          <View style={styles.modalOrderIdRow}>
            <Text style={styles.addrLabel}>TOTAL</Text>
            <Text style={styles.modalOrderIdValue}>₹{Math.round(totalPrice)}</Text>
          </View>
        )}
        <View style={{ height: insets.bottom + 16 }} />
      </View>
    </View>
  );
}
