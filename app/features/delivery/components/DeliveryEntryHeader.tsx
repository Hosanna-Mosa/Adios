import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/delivery/entry.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  styles: any;
  tokens: any;
}

export function DeliveryEntryHeader({
  insets,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 6 }]} entering={fadeIn(0)}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Package delivery</Text>
      <View style={styles.betaBadge}><Text style={styles.betaBadgeText}>Beta</Text></View>
    </Animated.View>
  );
}
