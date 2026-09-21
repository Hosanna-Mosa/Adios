import React from "react";

import { styles } from "./ActiveTaskCard.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface ActiveTaskCardProps {
  mode: "ride" | "delivery";
  time: string;
  pickup: string;
  dropoff: string;
  onGo: () => void;
}

export function ActiveTaskCard({ mode, time, pickup, dropoff, onGo }: ActiveTaskCardProps) {
  const isRide = mode === "ride";

  return (
    <Box style={styles.card}>
      <Box style={styles.header}>
          <Box style={[styles.badge, isRide ? styles.badgeRide : styles.badgeDelivery]}>
          <AppText style={[styles.badgeText, !isRide && styles.badgeTextDelivery]}>{isRide ? "Next Ride" : "Next Delivery"}</AppText>
        </Box>
        <AppText style={styles.time}>{time}</AppText>
      </Box>

      <Box style={styles.route}>
        <Box style={styles.routeLine}>
          <Box style={[styles.dot, styles.dotPickup]} />
          <Box style={[styles.line, isRide ? styles.lineRide : styles.lineDelivery]} />
          <Box style={[styles.dot, styles.dotDropoff]} />
        </Box>
        <Box style={styles.addresses}>
          <Box style={styles.addressItem}>
            <AppText style={styles.addressLabel}>Pickup</AppText>
            <AppText style={styles.addressText}>{pickup}</AppText>
          </Box>
          <Box style={styles.addressItem}>
            <AppText style={styles.addressLabel}>Drop-off</AppText>
            <AppText style={styles.addressText}>{dropoff}</AppText>
          </Box>
        </Box>
      </Box>

      <PressBox style={[styles.goButton, isRide ? styles.goButtonRide : styles.goButtonDelivery]} onPress={onGo}>
        <AppText style={styles.goButtonText}>Go</AppText>
      </PressBox>
    </Box>
  );
}
