import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { fadeIn } from "@/motion/presets";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPoint } from "@/contexts/packageDeliveryStore";
import type { PackageDeliveryConfirmStyles } from "../packageDeliveryConfirm.styles";
import { firstLine } from "../packageDelivery.utils";

// Over the map: back, "pickup → drop" (tap to change either end), and recenter.

interface Props {
  pickup: PackageDeliveryPoint;
  drop: PackageDeliveryPoint;
  bottomOffset: number;
  styles: PackageDeliveryConfirmStyles;
  tokens: ThemeTokens;
  onBack: () => void;
  onRecenter: () => void;
}

export function PackageDeliveryConfirmTopBar({ pickup, drop, bottomOffset, styles, tokens, onBack, onRecenter }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Animated.View style={styles.topBar} entering={fadeIn(0)}>
        <TouchableOpacity style={styles.circleBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.back")}>
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.routeChip} onPress={onBack} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.changeAddress")}>
          <Text style={styles.routeChipText} numberOfLines={1}>{firstLine(pickup.address)} → {firstLine(drop.address)}</Text>
          <Feather name="edit-2" size={moderateScale(14)} color={tokens.sec} />
        </TouchableOpacity>
      </Animated.View>
      <TouchableOpacity
        style={[styles.circleBtn, styles.recenterBtn, { bottom: bottomOffset + 12 }]}
        onPress={onRecenter}
        accessibilityRole="button"
        accessibilityLabel={t("app.packageDelivery.recenter")}
      >
        <Ionicons name="locate" size={moderateScale(18)} color={tokens.text} />
      </TouchableOpacity>
    </>
  );
}
