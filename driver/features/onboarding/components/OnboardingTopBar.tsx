import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../onboarding.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Back arrow (only once there is somewhere to go back to) and, when given, Skip. */
export function OnboardingTopBar({
  canGoBack,
  onBack,
  onSkip,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onSkip?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.topBar}>
      {canGoBack ? (
        <Touchable onPress={onBack} style={styles.topBarBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </Touchable>
      ) : (
        <Box style={{ width: 40 }} />
      )}
      {onSkip ? (
        <Touchable onPress={onSkip} style={styles.topBarBtn}>
          <AppText style={styles.skipText}>{t("actions.skip")}</AppText>
        </Touchable>
      ) : (
        <Box style={{ width: 40 }} />
      )}
    </Box>
  );
}
