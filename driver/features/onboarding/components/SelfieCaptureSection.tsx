import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { selfieSectionStyles } from "../onboarding.styles";
import { InfoBanner } from "./InfoBanner";

/** Selfie step: the framing viewfinder, the shutter, and the captured state. */
export function SelfieCaptureSection({
  captured,
  onCapture,
}: {
  captured: boolean;
  onCapture: () => void;
}) {
  return (
    <View style={{ gap: 20, alignItems: "center" }}>
      <View style={selfieSectionStyles.viewfinder}>
        <View style={selfieSectionStyles.viewfinderInner}>
          <Feather name="camera" size={36} color={Colors.textMuted} />
          <Text style={selfieSectionStyles.viewfinderText}>
            Position your face within the frame
          </Text>
        </View>
        {/* Oval cutout guidelines */}
        <View style={selfieSectionStyles.oval} />
      </View>

      {!captured ? (
        <TouchableOpacity
          style={selfieSectionStyles.captureBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onCapture();
          }}
          activeOpacity={0.8}
        >
          <Feather name="camera" size={24} color={Colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={{ alignItems: "center", gap: 12 }}>
          <InfoBanner icon="check-circle" text="Photo captured successfully!" />
        </View>
      )}

      <Text style={selfieSectionStyles.guidelines}>
        Make sure your face is clearly visible, well-lit, and without hats or sunglasses.
      </Text>
    </View>
  );
}
