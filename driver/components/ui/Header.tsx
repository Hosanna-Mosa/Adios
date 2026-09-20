import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

interface Props {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  scrollY?: SharedValue<number>;
  blurThreshold?: number;
  transparent?: boolean;
}

/** Mirrors app/components/ui/Header.tsx. */
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

  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={{ paddingTop: insets.top }}>
      {scrollY ? (
        <Animated.View style={[StyleSheet.absoluteFillObject, scrollLinkedStyle]}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
        </Animated.View>
      ) : !transparent ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.background }]} />
      ) : null}

      <View style={styles.row}>
        {showBack ? (
          <Pressable hitSlop={12} onPress={handleBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={moderateScale(22)} color={Colors.text} />
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
    fontSize: moderateScale(18),
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
