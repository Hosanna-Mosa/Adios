import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

import { NotFoundBody } from "@/features/home/components/NotFoundBody";

export default function NotFoundScreen() {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerShown: false }} />
      <NotFoundBody
        styles={styles}
      />
    </>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: tokens.bg, paddingHorizontal: 32 },
    code: { fontFamily: fontFamilies.heading.bold, fontSize: moderateScale(56), letterSpacing: -2, color: accent.accent, lineHeight: moderateScale(56) },
    title: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(19), color: tokens.text, marginTop: 16 },
    subtitle: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20), color: tokens.sec, textAlign: "center", marginTop: 8, marginBottom: 24 },
    button: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(48), paddingHorizontal: 32, alignItems: "center", justifyContent: "center" },
    buttonText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(14), color: accent.on },
  });
