import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { fadeIn, fadeInUp } from "@/motion/presets";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryHomeStyles } from "../packageDeliveryHome.styles";

// The banner at the top of the package delivery screen: what the service is, drawn with the
// two vehicles that carry it.

interface Props {
  styles: PackageDeliveryHomeStyles;
  tokens: ThemeTokens;
  onBack: () => void;
}

const SCOOTER = require("@/assets/images/services/package_delivery_scooter.png");
const BAG = require("@/assets/images/services/package_delivery_hero.png");
const AUTO = require("@/assets/images/services/auto_resized.png");

export function PackageDeliveryHero({ styles, tokens, onBack }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.hero}>
      <View style={styles.heroTopRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.back")}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
      </View>
      <Animated.View style={styles.heroText} entering={fadeIn(0)}>
        <Text style={styles.heroEyebrow}>{t("app.packageDelivery.heroEyebrow")}</Text>
        <Text style={styles.heroTitle}>{t("app.packageDelivery.heroTitle")}</Text>
      </Animated.View>
      <Animated.View style={styles.heroArt} entering={fadeInUp(80)}>
        <Image source={SCOOTER} style={styles.heroScooter} resizeMode="contain" />
        <Image source={BAG} style={styles.heroBag} resizeMode="contain" />
        <Image source={AUTO} style={styles.heroAuto} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}
