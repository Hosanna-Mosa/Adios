import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { selfieSectionStyles } from "../onboarding.styles";
import { InfoBanner } from "./InfoBanner";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Selfie step: the framing viewfinder, the shutter, and the captured state. */
export function SelfieCaptureSection({
  captured,
  onCapture,
}: {
  captured: boolean;
  onCapture: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={{ gap: 20, alignItems: "center" }}>
      <Box style={selfieSectionStyles.viewfinder}>
        <Box style={selfieSectionStyles.viewfinderInner}>
          <Feather name="camera" size={36} color={Colors.textMuted} />
          <AppText style={selfieSectionStyles.viewfinderText}>
            {t("onboarding.positionYourFaceWithinTheFrame")}
          </AppText>
        </Box>
        {/* Oval cutout guidelines */}
        <Box style={selfieSectionStyles.oval} />
      </Box>

      {!captured ? (
        <Touchable
          style={selfieSectionStyles.captureBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onCapture();
          }}
          activeOpacity={0.8}
        >
          <Feather name="camera" size={24} color={Colors.white} />
        </Touchable>
      ) : (
        <Box style={{ alignItems: "center", gap: 12 }}>
          <InfoBanner icon="check-circle" text={t("onboarding.photoCapturedSuccessfully")} />
        </Box>
      )}

      <AppText style={selfieSectionStyles.guidelines}>
        {t("onboarding.faceGuidelines")}
      </AppText>
    </Box>
  );
}
