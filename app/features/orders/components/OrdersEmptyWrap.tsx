import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  orders: any;
  styles: any;
  tokens: any;
}

export function OrdersEmptyWrap({
  orders,
  styles,
  tokens,
}: Props) {
  return (
    <Animated.View style={styles.emptyWrap} entering={fadeInUp(0)}>
      <View style={styles.emptyIconCircle}><Ionicons name="receipt-outline" size={moderateScale(28)} color={tokens.brand} /></View>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>Food, meat, rides, helpers and courier runs will all show up here once you place your first one.</Text>
      <Button title="Explore Flavour" onPress={() => router.replace("/(tabs)")} fullWidth />
    </Animated.View>
  );
}
