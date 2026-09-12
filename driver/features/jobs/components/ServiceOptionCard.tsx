import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { fadeIn } from "@/motion/presets";
import { styles } from "./GoOnlineModal.styles";

/** One selectable service on the go-online sheet.
 *
 * Ride and food were written out twice, identical apart from the icon, the
 * copy, and one extra style on the food icon wrapper. */
export function ServiceOptionCard({
  icon,
  name,
  description,
  selected,
  onToggle,
  press,
  iconStyle,
}: {
  icon: keyof typeof Feather.glyphMap;
  name: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  press: { animatedStyle: any; onPressIn: () => void; onPressOut: () => void };
  iconStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View style={press.animatedStyle}>
      <Pressable
        style={[styles.serviceCard, selected && styles.serviceCardActive]}
        onPress={onToggle}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <View style={styles.serviceLeft}>
          <View style={[styles.checkbox, selected && styles.checkboxActive]}>
            {selected && <Feather name="check" size={14} color={Colors.white} />}
          </View>
          <View style={styles.serviceInfo}>
            <View style={[styles.serviceIconWrap, iconStyle]}>
              <Feather
                name={icon}
                size={18}
                color={selected ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View>
              <Text style={[styles.serviceName, selected && styles.serviceNameActive]}>
                {name}
              </Text>
              <Text style={styles.serviceDesc}>{description}</Text>
            </View>
          </View>
        </View>
        {selected && (
          <Animated.View entering={fadeIn()} style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Selected</Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}
