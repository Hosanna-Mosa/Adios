import { ActivityIndicator, Text, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type CartStyles } from "@/features/food/cart.styles";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: CartStyles;
}

export function CartRestoringState({
  accent,
  styles,
}: Props) {
  return (
    <View style={styles.emptyWrap}>
      <ActivityIndicator color={accent.accent} />
      <Text style={styles.emptySubtitle}>Restoring your cart…</Text>
    </View>
  );
}
