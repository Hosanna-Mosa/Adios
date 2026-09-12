import { ActivityIndicator, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type MeatStyles } from "@/features/meat/meat-centers.styles";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  styles: MeatStyles;
}

export function MeatCentersCenterContainer({
  accent,
  styles,
}: Props) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={accent.accent} />
    </View>
  );
}
