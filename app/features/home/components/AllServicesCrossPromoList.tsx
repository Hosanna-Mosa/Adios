import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/all-services.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
  tokens: any;
}

export function AllServicesCrossPromoList({
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.crossPromoList}>
      <Animated.View entering={staggerListItem(0)}>
        <TouchableOpacity style={styles.crossPromoRow} activeOpacity={0.85} onPress={() => router.push("/helper-task")}>
          <View style={[styles.crossPromoIcon, { backgroundColor: tokens.services.task.skin }]}>
            <Ionicons name="construct-outline" size={moderateScale(18)} color={tokens.services.task.accent} />
          </View>
          <View style={styles.crossPromoTextWrap}>
            <Text style={styles.crossPromoTitle}>Hire a helper</Text>
            <Text style={styles.crossPromoSubtitle}>From ₹120 / hour</Text>
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(18)} color={tokens.muted} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={staggerListItem(1)}>
        <TouchableOpacity style={styles.crossPromoRow} activeOpacity={0.85} onPress={() => router.push("/delivery/entry")}>
          <View style={[styles.crossPromoIcon, { backgroundColor: tokens.services.delivery.skin }]}>
            <Ionicons name="cube-outline" size={moderateScale(18)} color={tokens.services.delivery.accent} />
          </View>
          <View style={styles.crossPromoTextWrap}>
            <Text style={styles.crossPromoTitle}>Package delivery</Text>
            <Text style={styles.crossPromoSubtitle}>Multi-stop courier · from ₹39</Text>
          </View>
          <View style={styles.betaBadge}>
            <Text style={styles.betaBadgeText}>Beta</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
