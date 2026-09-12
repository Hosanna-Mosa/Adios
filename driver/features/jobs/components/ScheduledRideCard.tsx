import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../home.styles";
import { formatCurrency } from "@/utils/format";
import { formatReservedAt } from "../utils/offer";

/** A ride reserved for later: when, where, who, and what it pays. */
export function ScheduledRideCard({
  ride,
  index,
  disabled,
  onStart,
}: {
  ride: any;
  index: number;
  disabled: boolean;
  onStart: () => void;
}) {
  const pickup = ride.stops?.[0]?.address || "Pickup Location";
  const drop = ride.stops?.[ride.stops.length - 1]?.address || "Drop Location";
  const dateStr = formatReservedAt(ride.reservedAt);

  return (
    <Animated.View entering={staggerListItem(index)} style={styles.scheduledCard}>
      <View style={styles.scheduledHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.scheduledTime}>{dateStr}</Text>
        </View>
        <Text style={styles.scheduledPrice}>{formatCurrency(Math.round(ride.totalPrice * 0.8), { decimals: false })}</Text>
      </View>

      <View style={styles.scheduledBody}>
        <View style={styles.addressLine}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.addressText} numberOfLines={1}>{pickup}</Text>
        </View>
        <View style={styles.connectorLine} />
        <View style={styles.addressLine}>
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <Text style={styles.addressText} numberOfLines={1}>{drop}</Text>
        </View>
      </View>

      <View style={styles.scheduledFooter}>
        <View>
          <Text style={styles.customerName}>Rider: {ride.user?.name || "Customer"}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{ride.serviceType?.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.startRideBtn, disabled && { opacity: 0.5 }]}
          disabled={disabled}
          onPress={onStart}
        >
          <Text style={styles.startRideBtnText}>Start Ride</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
