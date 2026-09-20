import { Text, View } from "react-native";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
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
