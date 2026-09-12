import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";

/** Dev panel that fakes driver movement toward a stop.
 *
 * This markup was written out four times across the order stages, differing
 * only in the fallback ETA/distance shown when the simulator is idle and in
 * which stop it drives toward. */
export function GpsSimulatorPanel({
  isSimulating,
  speed,
  eta,
  remainingDistance,
  idleEta,
  idleDistance,
  onToggle,
}: {
  isSimulating: boolean;
  speed: number | string;
  eta: number | string;
  remainingDistance: number | string;
  idleEta?: string;
  idleDistance?: string;
  onToggle: () => void;
}) {
  return (
    <View style={styles.simPanel}>
      <View style={styles.simStatsRow}>
        <View style={styles.simStatItem}>
          <Text style={styles.simStatLabel}>Speed</Text>
          <Text style={styles.simStatValue}>{isSimulating ? `${speed} km/h` : "0 km/h"}</Text>
        </View>
        <View style={styles.simStatItem}>
          <Text style={styles.simStatLabel}>ETA</Text>
          <Text style={styles.simStatValue}>{isSimulating ? `${eta} min` : idleEta}</Text>
        </View>
        <View style={styles.simStatItem}>
          <Text style={styles.simStatLabel}>Distance</Text>
          <Text style={styles.simStatValue}>
            {isSimulating ? `${remainingDistance} km` : idleDistance}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.simToggleBtn, isSimulating ? styles.simToggleBtnActive : null]}
        onPress={onToggle}
      >
        <Ionicons name={isSimulating ? "pause" : "navigate"} size={16} color={Colors.white} />
        <Text style={styles.simToggleText}>
          {isSimulating ? "Stop GPS Simulator" : "Simulate Travel Coordinates"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
