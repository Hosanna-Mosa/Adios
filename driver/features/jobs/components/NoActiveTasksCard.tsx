import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";

/** Shown when the driver has no job in progress. */
export function NoActiveTasksCard({ isOnline }: { isOnline: boolean }) {
  return (
    <View style={styles.emptyTasksCard}>
      <Image
        source={require("../../../assets/images/clipboard_empty_state.png")}
        style={styles.emptyTasksImg}
        resizeMode="contain"
      />
      <View style={styles.emptyTasksCopy}>
        <Text style={styles.emptyTasksTitle}>No Active Tasks</Text>
        <Text style={styles.emptyTasksDesc}>
          {isOnline
            ? "You are online and ready\nto receive bookings.\nKeep the app open."
            : "Go online to receive\nand accept bookings."}
        </Text>
      </View>
      <TouchableOpacity style={styles.calendarBtn}>
        <Feather name="calendar" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
