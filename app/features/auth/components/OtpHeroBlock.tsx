import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  formatPhone: any;
  phone: any;
  styles: any;
}

export function OtpHeroBlock({
  formatPhone,
  phone,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.heroBlock} entering={fadeInUp(0)}>
      <Text style={styles.headline} numberOfLines={1}>{t("app.auth.verifyYourNumber")}</Text>
      <Text style={styles.subhead}>
        {t("app.auth.weSentA6digitCodeTo")}{" "}
        <Text style={styles.subheadStrong}>+91 {formatPhone(phone || "")}</Text>.{" "}
        <Text style={styles.subheadLink} onPress={() => router.back()}>
          {t("app.auth.change")}
        </Text>
      </Text>
    </Animated.View>
  );
}
