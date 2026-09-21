import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type SignupStyles } from "@/features/auth/signup.styles";

// Moved out of app/signup.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: SignupStyles;
}

export function SignupHeroBlock({
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.heroBlock} entering={fadeInUp(0)}>
      <Text style={styles.headline} numberOfLines={1}>{t("app.auth.createYourAccount")}</Text>
      <Text style={styles.subhead}>
        {t("app.auth.takesAboutAMinuteWeaposllVerify")}
      </Text>
    </Animated.View>
  );
}
