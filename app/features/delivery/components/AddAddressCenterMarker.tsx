import { ActivityIndicator, Text, View } from "react-native";
import { type ThemeTokens } from "@/constants/colors";
import { type AddAddressStyles } from "@/features/delivery/add-address.styles";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  isResolvingAddress: boolean;
  styles: AddAddressStyles;
  tokens: ThemeTokens;
}

export function AddAddressCenterMarker({
  isResolvingAddress,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.centerMarker} pointerEvents="none">
      <View style={styles.dragHint}>
        {isResolvingAddress ? (
          <ActivityIndicator size="small" color={tokens.bg} />
        ) : (
          <Text style={styles.dragHintText}>Move the pin to adjust</Text>
        )}
      </View>
      <View style={styles.dragHintStem} />
      <View style={styles.pinHead}><View style={styles.pinDot} /></View>
      <View style={styles.pinStem} />
      <View style={styles.pinShadow} />
    </View>
  );
}
