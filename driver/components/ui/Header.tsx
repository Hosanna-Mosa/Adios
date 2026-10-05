import React from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeBlurView } from "./SafeBlurView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

interface Props {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  scrollY?: SharedValue<number>;
  blurThreshold?: number;
  transparent?: boolean;
}

/** Presentational header bar. Knows nothing about navigation — pass `onBack`.
 * Pass onBack={() => router.back()} for the usual go-back behaviour.
 * Mirrors app/components/ui/Header.tsx. */
export function Header({
  title,
  onBack,
  showBack = true,
  right,
  scrollY,
  blurThreshold = 40,
  transparent = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const scrollLinkedStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: transparent ? 0 : 1 };
    return { opacity: interpolate(scrollY.value, [0, blurThreshold], [transparent ? 0 : 1, 1], "clamp") };
  });

  return (
    <Box style={{ paddingTop: insets.top }}>
      {scrollY ? (
        <Animated.View style={[StyleSheet.absoluteFillObject, scrollLinkedStyle]}>
          <SafeBlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      ) : !transparent ? (
        <Box style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.background }]} />
      ) : null}

      <Box style={styles.row}>
        {showBack && onBack ? (
          <PressBox hitSlop={12} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={moderateScale(22)} color={Colors.text} />
          </PressBox>
        ) : (
          <Box style={styles.iconBtn} />
        )}
        {title ? (
          <AppText style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          <Box style={{ flex: 1 }} />
        )}
        <Box style={styles.rightSlot}>{right}</Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  row: {
    height: moderateScale(52),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(8),
    gap: 4,
  },
  iconBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.heading.semibold,
    fontSize: typography.sizes.large,
    color: Colors.text,
    textAlign: "center",
    marginHorizontal: 4,
  },
  rightSlot: {
    minWidth: moderateScale(38),
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
