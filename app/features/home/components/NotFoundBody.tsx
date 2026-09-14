import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <>
    <View style={styles.root}>
      <Animated.View style={{ alignItems: "center" }} entering={fadeInUp(0)}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>{t("app.home.thisPageMoved")}</Text>
        <Text style={styles.subtitle}>{t("app.home.theLinkYouFollowedDoesnapostExist")}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)")} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{t("app.home.goHome")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
    </>
  );
}
