import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";

/** Avatar initials, name, phone, and the online/offline badge. */
export function ProfileIdentityCard({
  driverName,
  driverPhone,
  isOnline,
}: {
  driverName?: string | null;
  driverPhone?: string | null;
  isOnline: boolean;
}) {
  const initials = driverName
    ? driverName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DR";

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{driverName || "Driver"}</Text>
        <Text style={styles.profilePhone}>{driverPhone || "+91 XXXXX XXXXX"}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isOnline ? Colors.successLight : Colors.surfaceAlt },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? Colors.success : Colors.textMuted },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? Colors.success : Colors.textMuted },
            ]}
          >
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
    </View>
  );
}
