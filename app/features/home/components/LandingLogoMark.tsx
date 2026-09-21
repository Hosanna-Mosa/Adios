import { Text, View } from "react-native";
import { type LandingStyles } from "@/features/home/index.styles";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: LandingStyles;
}

export function LandingLogoMark({
  styles,
}: Props) {
  return (
    <View style={styles.logoMark}>
      <Text style={styles.logoMarkText}>F</Text>
    </View>
  );
}
