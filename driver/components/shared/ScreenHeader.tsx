import React from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface Props {
  title: string;
  onBack: () => void;
  /** Callers already compute this (some add a web-only offset), so it stays a
   *  prop rather than reading insets here. */
  paddingTop: number;
  /** Trailing slot — e.g. the "Mark all read" action on notifications. */
  right?: React.ReactNode;
  testID?: string;
}

/** The back-arrow + title bar used at the top of a pushed screen.
 *
 * Replaces AddressScreenHeader, SupportHeader, SupportScreenHeader and
 * PayoutHeader, which shared this exact structure but each carried their own
 * padding, back-button shape and title weight. One spec now, so the four
 * screens stop drifting apart. */
export function ScreenHeader({ title, onBack, paddingTop, right, testID }: Props) {
  const { t } = useTranslation();
  return (
    <Box style={[styles.header, { paddingTop }]} testID={testID}>
      <Touchable style={styles.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel={t("actions.goBack")}>
        <Ionicons name="arrow-back" size={moderateScale(22)} color={Colors.text} />
      </Touchable>
      <AppText style={styles.headerTitle} numberOfLines={1}>
        {title}
      </AppText>
      {right ? <Box style={styles.right}>{right}</Box> : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.large,
    fontWeight: "700",
    color: Colors.text,
  },
  right: {
    justifyContent: "center",
  },
});
