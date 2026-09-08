import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile-tab.styles";

/** Tappable summary of the vehicle currently attached to the driver. */
export function CurrentVehicleRow({
  label,
  detail,
  onPress,
}: {
  label: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.currentVehicleCard} onPress={onPress}>
      <View style={styles.vehicleIconBg}>
        <Feather name="truck" size={18} color={Colors.text} />
      </View>
      <View style={styles.vehicleCopy}>
        <Text style={styles.vehicleTitleSmall}>{label}</Text>
        <Text style={styles.vehicleValue}>{detail}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}
