import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../home.styles";
import { formatCurrency } from "@/utils/format";
import { formatReservedAt } from "../utils/offer";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
    <AnimatedBox entering={staggerListItem(index)} style={styles.scheduledCard}>
      <Box style={styles.scheduledHeader}>
        <Box style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="calendar" size={16} color={Colors.primary} />
          <AppText style={styles.scheduledTime}>{dateStr}</AppText>
        </Box>
        <AppText style={styles.scheduledPrice}>{formatCurrency(Math.round(ride.totalPrice * 0.8), { decimals: false })}</AppText>
      </Box>

      <Box style={styles.scheduledBody}>
        <Box style={styles.addressLine}>
          <Box style={[styles.dot, { backgroundColor: Colors.success }]} />
          <AppText style={styles.addressText} numberOfLines={1}>{pickup}</AppText>
        </Box>
        <Box style={styles.connectorLine} />
        <Box style={styles.addressLine}>
          <Box style={[styles.dot, { backgroundColor: Colors.error }]} />
          <AppText style={styles.addressText} numberOfLines={1}>{drop}</AppText>
        </Box>
      </Box>

      <Box style={styles.scheduledFooter}>
        <Box>
          <AppText style={styles.customerName}>Rider: {ride.user?.name || "Customer"}</AppText>
          <Box style={styles.badge}>
            <AppText style={styles.badgeText}>{ride.serviceType?.toUpperCase()}</AppText>
          </Box>
        </Box>
        <Touchable
          style={[styles.startRideBtn, disabled && { opacity: 0.5 }]}
          disabled={disabled}
          onPress={onStart}
        >
          <AppText style={styles.startRideBtnText}>Start Ride</AppText>
        </Touchable>
      </Box>
    </AnimatedBox>
  );
}
