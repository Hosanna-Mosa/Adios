import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { fadeIn } from "@/motion/presets";
import { styles } from "./GoOnlineModal.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** One selectable service on the go-online sheet.
 *
 * Ride and food were written out twice, identical apart from the icon, the
 * copy, and one extra style on the food icon wrapper. */
export function ServiceOptionCard({
  icon,
  name,
  description,
  selected,
  onToggle,
  press,
  iconStyle,
}: {
  icon: keyof typeof Feather.glyphMap;
  name: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  press: { animatedStyle: any; onPressIn: () => void; onPressOut: () => void };
  iconStyle?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  return (
    <AnimatedBox style={press.animatedStyle}>
      <PressBox
        style={[styles.serviceCard, selected && styles.serviceCardActive]}
        onPress={onToggle}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <Box style={styles.serviceLeft}>
          <Box style={[styles.checkbox, selected && styles.checkboxActive]}>
            {selected && <Feather name="check" size={14} color={Colors.white} />}
          </Box>
          <Box style={styles.serviceInfo}>
            <Box style={[styles.serviceIconWrap, iconStyle]}>
              <Feather
                name={icon}
                size={18}
                color={selected ? Colors.primary : Colors.textMuted}
              />
            </Box>
            <Box>
              <AppText style={[styles.serviceName, selected && styles.serviceNameActive]}>
                {name}
              </AppText>
              <AppText style={styles.serviceDesc}>{description}</AppText>
            </Box>
          </Box>
        </Box>
        {selected && (
          <AnimatedBox entering={fadeIn()} style={styles.selectedBadge}>
            <AppText style={styles.selectedBadgeText}>{t("jobs.selected")}</AppText>
          </AnimatedBox>
        )}
      </PressBox>
    </AnimatedBox>
  );
}
