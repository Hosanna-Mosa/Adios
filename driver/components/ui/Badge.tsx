import React from "react";
import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Colors, radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface BadgeProps {
  label: string;
  tone?: "brand" | "success" | "warning" | "error" | "neutral";
  testID?: string;
}

const toneStyles = {
  brand: { bg: `${Colors.brand}1F`, fg: Colors.brand },
  success: { bg: Colors.successLight, fg: Colors.success },
  warning: { bg: Colors.warningLight, fg: Colors.warning },
  error: { bg: Colors.errorLight, fg: Colors.error },
  neutral: { bg: Colors.surfaceContainer, fg: Colors.textSecondary },
};

/** Mirrors app/components/ui/Badge.tsx. */
export function Badge({ label, tone = "neutral", testID }: BadgeProps) {
  const toneStyle = toneStyles[tone];
  return (
    <Box testID={testID} style={[styles.badgeBase, { backgroundColor: toneStyle.bg }]}>
      <AppText style={[styles.badgeLabel, { color: toneStyle.fg }]}>{label}</AppText>
    </Box>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  testID?: string;
}

/** Mirrors app/components/ui/Badge.tsx (Chip). */
export function Chip({ label, selected = false, onPress, icon, testID }: ChipProps) {
  return (
    <PressBox testID={testID} onPress={onPress} style={[styles.chipBase, selected && styles.chipSelected]}>
      {icon}
      <AppText style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</AppText>
    </PressBox>
  );
}

const styles = StyleSheet.create({
  badgeBase: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
  },
  badgeLabel: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.small,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  chipBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: moderateScale(14),
    height: moderateScale(36),
  },
  chipSelected: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  chipLabel: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: Colors.text,
  },
  chipLabelSelected: {
    color: Colors.onBrand,
  },
});
