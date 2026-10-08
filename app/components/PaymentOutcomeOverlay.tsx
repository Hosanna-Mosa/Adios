import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { usePaymentOutcomeStore } from "@/contexts/paymentOutcomeStore";

const SOURCES = {
  success: require("@/assets/lottie/payment-success.json"),
  failure: require("@/assets/lottie/payment-failure.json"),
};

// The animations run 2 s; hold the last frame briefly before stepping aside.
const VISIBLE_MS = { success: 2300, failure: 2600 };

/**
 * Full-screen payment result played when the customer returns from the
 * Razorpay checkout (see utils/razorpay.ts). Sits above every screen, so the
 * app can already navigate to the order underneath it on success. Tapping
 * anywhere skips it.
 */
export function PaymentOutcomeOverlay() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const outcome = usePaymentOutcomeStore((s) => s.outcome);
  const playId = usePaymentOutcomeStore((s) => s.playId);
  const finish = usePaymentOutcomeStore((s) => s.finish);
  const setHasPlayer = usePaymentOutcomeStore((s) => s.setHasPlayer);

  useEffect(() => {
    setHasPlayer(true);
    return () => setHasPlayer(false);
  }, [setHasPlayer]);

  useEffect(() => {
    if (!outcome) return;
    Haptics.notificationAsync(
      outcome === "success" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    const timer = setTimeout(finish, VISIBLE_MS[outcome]);
    return () => clearTimeout(timer);
  }, [outcome, playId, finish]);

  if (!outcome) return null;
  const isSuccess = outcome === "success";

  return (
    <Animated.View key={playId} entering={FadeIn.duration(180)} exiting={FadeOut.duration(220)} style={styles.backdrop}>
      <Pressable style={styles.content} onPress={finish} accessibilityRole="alert">
        <LottieView source={SOURCES[outcome]} autoPlay loop={false} style={styles.animation} />
        <Animated.View entering={ZoomIn.delay(260).duration(260)} style={styles.copy}>
          <Text style={[styles.title, { color: isSuccess ? tokens.success : tokens.error }]}>
            {isSuccess ? t("app.payment.successTitle") : t("app.food.paymentFailed")}
          </Text>
          {isSuccess && <Text style={styles.subtitle}>{t("app.payment.successHint")}</Text>}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000, backgroundColor: tokens.bg },
    content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
    animation: { width: moderateScale(200), height: moderateScale(200) },
    copy: { alignItems: "center", gap: 6, marginTop: 4 },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge, textAlign: "center" },
    subtitle: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, textAlign: "center" },
  });
