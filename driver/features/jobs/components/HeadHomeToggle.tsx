import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** "Head Home" mode — biases dispatch toward the driver's home address. */
export function HeadHomeToggle({
  homeMode,
  onToggle,
}: {
  homeMode: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PressBox
      style={[styles.homeModeRow, homeMode && styles.homeModeRowActive]}
      onPress={onToggle}
    >
      <Box style={styles.homeModeLeft}>
        <Box style={[styles.homeModeIconWrap, homeMode && styles.homeModeIconWrapActive]}>
          <Feather name="home" size={18} color={homeMode ? Colors.white : Colors.brand} />
        </Box>
        <Box style={styles.homeModeTextWrap}>
          <AppText style={[styles.homeModeLabel, homeMode && styles.homeModeLabelActive]}>
            {t("jobs.headHome")}
          </AppText>
          <AppText style={styles.homeModeDesc}>
            {homeMode
              ? t("jobs.gettingOrdersTowardYourHome")
              : t("jobs.receiveOrdersHeadingTowardHome")}
          </AppText>
        </Box>
      </Box>
      <Box style={[styles.homeModeSwitch, homeMode && styles.homeModeSwitchActive]}>
        <Box style={[styles.homeModeSwitchThumb, homeMode && styles.homeModeSwitchThumbActive]} />
      </Box>
    </PressBox>
  );
}
