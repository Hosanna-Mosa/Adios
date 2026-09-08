import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

/** Green confirmation that the driver's GPS puts them at the stop. */
export function GpsVerifiedBox({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.gpsVerifiedBox}>
      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.gpsVerifiedTitle}>{title}</Text>
        <Text style={styles.gpsVerifiedDesc}>{description}</Text>
      </View>
    </View>
  );
}
