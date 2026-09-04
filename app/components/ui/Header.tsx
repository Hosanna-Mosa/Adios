import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  /** Pass a scroll-position shared value to fade in a blurred background as
   * the user scrolls past `blurThreshold` — used for sticky headers over
   * content (e.g. the home screen). Omit for a plain static header. */
  scrollY?: SharedValue<number>;
  blurThreshold?: number;
  transparent?: boolean;
}

export function Header({
  title,
  onBack,
  showBack = true,
  right,
  scrollY,
  blurThreshold = 40,
  transparent = false,
}: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(tokens, insets.top), [theme, insets.top]);

  const scrollLinkedStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: transparent ? 0 : 1 };
    return { opacity: interpolate(scrollY.value, [0, blurThreshold], [transparent ? 0 : 1, 1], "clamp") };
  });

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.wrap}>
      {scrollY ? (
        <Animated.View style={[StyleSheet.absoluteFillObject, scrollLinkedStyle]}>
          <BlurView intensity={80} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      ) : !transparent ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tokens.bg }]} />
      ) : null}

      <View style={styles.row}>
        {showBack ? (
          <Pressable hitSlop={12} onPress={handleBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={moderateScale(22)} color={tokens.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={styles.rightSlot}>{right}</View>
      </View>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens, insetTop: number) =>
  StyleSheet.create({
    wrap: {
      paddingTop: insetTop,
    },
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
      fontSize: moderateScale(18),
      color: tokens.text,
      textAlign: "center",
      marginHorizontal: 4,
    },
    rightSlot: {
      minWidth: moderateScale(38),
      alignItems: "flex-end",
      justifyContent: "center",
    },
  });
