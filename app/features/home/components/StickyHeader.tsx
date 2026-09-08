import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Animated from "react-native-reanimated";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  activeService: any;
  areaLabel: any;
  handleServiceSwitch: any;
  insets: any;
  stickyHeaderAnimatedStyle: any;
  styles: any;
  tokens: any;
}

export function StickyHeader({
  activeService,
  areaLabel,
  handleServiceSwitch,
  insets,
  stickyHeaderAnimatedStyle,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View
      style={[styles.stickyHeader, { paddingTop: insets.top + 8 }, stickyHeaderAnimatedStyle]}
    >
      <View style={styles.stickyRow}>
        <Text style={styles.stickyAddress} numberOfLines={1}>{areaLabel}</Text>
        <View style={styles.stickyActions}>
          <View style={styles.stickyTogglePill}>
            <TouchableOpacity
              style={[styles.stickyToggleCell, activeService === "Food" && { backgroundColor: tokens.surface }]}
              onPress={() => handleServiceSwitch("Food")}
            >
              <Text style={styles.stickyToggleEmoji}>🍛</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyToggleCell, activeService === "Meat" && { backgroundColor: tokens.surface }]}
              onPress={() => handleServiceSwitch("Meat")}
            >
              <Text style={styles.stickyToggleEmoji}>🍖</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.stickyIconBtn} onPress={() => router.push("/all-services")}>
            <Text style={styles.stickyToggleEmoji}>🛺</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stickyIconBtn} onPress={() => router.push("/helper-task")}>
            <Text style={styles.stickyToggleEmoji}>🧰</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
