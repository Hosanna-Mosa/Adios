import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useAuthStore } from "@/contexts/authStore";

// "Skip" on Login and Sign up: browse as a guest. Opened from a screen that needed an
// account (checkout, Orders...) it just returns there; as the first screen it goes Home.
export function skipAuth() {
  useAuthStore.getState().continueAsGuest();
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)");
}

export function SkipButton({ tokens }: { tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={skipAuth}
      activeOpacity={0.7}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t("app.auth.skip")}
      style={{ marginLeft: "auto", paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <Text style={{ fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec }}>
        {t("app.auth.skip")}
      </Text>
    </TouchableOpacity>
  );
}
