import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/+not-found.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
}

export function NotFoundBody({
  styles,
}: Props) {
  return (
    <>
    <View style={styles.root}>
      <Animated.View style={{ alignItems: "center" }} entering={fadeInUp(0)}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>This page moved</Text>
        <Text style={styles.subtitle}>The link you followed doesn&apos;t exist any more.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)")} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Go home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
    </>
  );
}
