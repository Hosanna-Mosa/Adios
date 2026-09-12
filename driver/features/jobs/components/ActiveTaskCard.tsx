import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./ActiveTaskCard.styles";

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
    <View style={styles.card}>
      <View style={styles.header}>
          <View style={[styles.badge, isRide ? styles.badgeRide : styles.badgeDelivery]}>
          <Text style={[styles.badgeText, !isRide && styles.badgeTextDelivery]}>{isRide ? "Next Ride" : "Next Delivery"}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      <View style={styles.route}>
        <View style={styles.routeLine}>
          <View style={[styles.dot, styles.dotPickup]} />
          <View style={[styles.line, isRide ? styles.lineRide : styles.lineDelivery]} />
          <View style={[styles.dot, styles.dotDropoff]} />
        </View>
        <View style={styles.addresses}>
          <View style={styles.addressItem}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText}>{pickup}</Text>
          </View>
          <View style={styles.addressItem}>
            <Text style={styles.addressLabel}>Drop-off</Text>
            <Text style={styles.addressText}>{dropoff}</Text>
          </View>
        </View>
      </View>

      <Pressable style={[styles.goButton, isRide ? styles.goButtonRide : styles.goButtonDelivery]} onPress={onGo}>
        <Text style={styles.goButtonText}>Go</Text>
      </Pressable>
    </View>
  );
}
