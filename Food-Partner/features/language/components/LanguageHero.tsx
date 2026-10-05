import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { BrandMark } from "@/components/ui/BrandMark";
import { fadeInUp } from "@/motion/presets";
import type { LanguageStyles } from "../language.styles";

/** Logo and "Choose your language" at the top of the first-launch screen. */
export function LanguageHero({ styles }: { styles: LanguageStyles }) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.hero}>
      <BrandMark size={64} />
      <Text style={styles.title}>{t("language.chooseTitle")}</Text>
      <Text style={styles.subtitle}>{t("language.chooseSubtitle")}</Text>
    </Animated.View>
  );
}
