import { Text, View } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  deliveryStop: any;
  isRide: any;
  pickupLabel: any;
  stops: any;
  styles: any;
  tokens: any;
}

export function TrackingAddrCard({
  accent,
  deliveryStop,
  isRide,
  pickupLabel,
  stops,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.addrCard}>
      <View style={styles.addrRail}>
        <View style={[styles.addrDot, { borderColor: accent.accent }]} />
        <View style={styles.addrLine} />
        <View style={[styles.addrDot, { backgroundColor: tokens.text, borderWidth: 0 }]} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 12 }}>
        <View>
          <Text style={styles.addrLabel}>{isRide ? "Pickup" : "Picked up from"}</Text>
          <Text style={styles.addrText} numberOfLines={1}>{pickupLabel}</Text>
        </View>
        <View>
          <Text style={styles.addrLabel}>{isRide ? "Drop-off" : "Delivering to"}</Text>
          <Text style={styles.addrText} numberOfLines={1}>{deliveryStop?.address || stops?.[stops.length - 1]?.address || "—"}</Text>
        </View>
      </View>
    </View>
  );
}
