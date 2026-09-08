import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";

/** "Head Home" mode — biases dispatch toward the driver's home address. */
export function HeadHomeToggle({
  homeMode,
  onToggle,
}: {
  homeMode: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={[styles.homeModeRow, homeMode && styles.homeModeRowActive]}
      onPress={onToggle}
    >
      <View style={styles.homeModeLeft}>
        <View style={[styles.homeModeIconWrap, homeMode && styles.homeModeIconWrapActive]}>
          <Feather name="home" size={18} color={homeMode ? Colors.white : Colors.brand} />
        </View>
        <View style={styles.homeModeTextWrap}>
          <Text style={[styles.homeModeLabel, homeMode && styles.homeModeLabelActive]}>
            Head Home
          </Text>
          <Text style={styles.homeModeDesc}>
            {homeMode
              ? "Getting orders toward your home"
              : "Receive orders heading toward home"}
          </Text>
        </View>
      </View>
      <View style={[styles.homeModeSwitch, homeMode && styles.homeModeSwitchActive]}>
        <View style={[styles.homeModeSwitchThumb, homeMode && styles.homeModeSwitchThumbActive]} />
      </View>
    </Pressable>
  );
}
