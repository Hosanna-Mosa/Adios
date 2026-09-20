import React from "react";

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
  return (
    <Box style={{ gap: 20, alignItems: "center" }}>
      <Box style={selfieSectionStyles.viewfinder}>
        <Box style={selfieSectionStyles.viewfinderInner}>
          <Feather name="camera" size={36} color={Colors.textMuted} />
          <AppText style={selfieSectionStyles.viewfinderText}>
            Position your face within the frame
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
          <InfoBanner icon="check-circle" text="Photo captured successfully!" />
        </Box>
      )}

      <AppText style={selfieSectionStyles.guidelines}>
        Make sure your face is clearly visible, well-lit, and without hats or sunglasses.
      </AppText>
    </Box>
  );
}
