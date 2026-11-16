import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { showAlert } from "@/components/ui/AppAlert";
import { skipAuth } from "@/components/shared/SkipButton";
import { type LandingStyles } from "../index.styles";

// The login screen: brand artwork on top, a sheet below with the phone field, "remember me"
// and Continue (sends the OTP), then the terms line.

interface Props {
  Reanimated: any;
  handleContinueWithOtp: () => void;
  handleForgotPassword: () => void;
  handleSignIn: () => void;
  identifier: any;
  insets: EdgeInsets;
  isPasswordVisible: boolean;
  loading: boolean;
  password: string;
  sendingOtp: any;
  email: string;
  setEmail: (v: string) => void;
  sendingEmailOtp: boolean;
  handleContinueWithEmail: () => void;
  setIdentifier: any;
  setIsPasswordVisible: any;
  setPassword: any;
  styles: LandingStyles;
  tokens: ThemeTokens;
}

const HERO = require("@/assets/images/adios_hero.png");
// Design: the artwork covers the top 57% of the screen, the login card the other 43%.
const HERO_SHARE = 0.57;
const HERO_BG = "#E1E4ED";

export function LandingBody({
  Reanimated, handleContinueWithOtp, identifier, insets, sendingOtp, setIdentifier, tokens,
  email, setEmail, sendingEmailOtp, handleContinueWithEmail,
}: Props) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  // 57% of the screen the user actually sees: measured from this container (on Android the window
  // height leaves out the system bars, so a share of it comes up short).
  const [rootHeight, setRootHeight] = useState(0);
  const height = rootHeight || windowHeight;
  const heroHeight = Math.round(height * HERO_SHARE);
  const [remember, setRemember] = useState(false);
  // Phone is the default; "Continue with email" swaps the field and emails the code instead.
  const [emailMode, setEmailMode] = useState(false);
  const digits = String(identifier ?? "").replace(/\D/g, "");
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const canContinue = emailMode ? emailOk : digits.length >= 10;
  const busy = emailMode ? sendingEmailOtp : !!sendingOtp;
  const onContinue = emailMode ? handleContinueWithEmail : handleContinueWithOtp;
  const soon = (title: string) => showAlert(title, t("app.auth.comingSoon", "This will be available soon."));

  return (
    <View style={[s.root, { backgroundColor: HERO_BG }]} onLayout={(e) => setRootHeight(e.nativeEvent.layout.height)}>
      <View style={{ height: heroHeight, backgroundColor: HERO_BG }}>
        <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
        <Pressable
          onPress={skipAuth}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("app.auth.skip", "Skip")}
          style={[s.skip, { top: insets.top + 8, backgroundColor: "rgba(255,255,255,0.85)" }]}
        >
          <Text style={[s.skipText, { color: tokens.brand }]}>{t("app.auth.skip", "Skip")}</Text>
        </Pressable>
      </View>

      <View style={[s.sheetWrap, { backgroundColor: tokens.surface }]}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
        <Reanimated.View
          entering={fadeInUp(90)}
          style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}
        >
          <Text style={[s.title, { color: tokens.brand }]}>{t("app.auth.loginOrSignUp", "Log in or Sign up")}</Text>
          <Text style={[s.sub, { color: tokens.text }]}>
            {emailMode ? t("app.auth.getStartedEmail", "Get started with your email") : t("app.auth.getStarted", "Get started with your phone number")}
          </Text>

          {emailMode ? (
            <View style={[s.box, { borderColor: tokens.border }]}>
              <Ionicons name="mail-outline" size={moderateScale(20)} color={tokens.brand} />
              <TextInput
                style={[s.input, { color: tokens.text }]}
                placeholder={t("app.auth.enterEmail", "Enter your email")}
                placeholderTextColor={tokens.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel={t("app.auth.enterEmail", "Enter your email")}
                returnKeyType="done"
                onSubmitEditing={() => canContinue && onContinue()}
              />
            </View>
          ) : (
          <View style={s.phoneRow}>
            <View style={[s.box, s.country, { borderColor: tokens.border }]} accessibilityLabel="India">
              <Text style={s.flag}>🇮🇳</Text>
              <Ionicons name="chevron-down" size={moderateScale(16)} color={tokens.text} />
            </View>
            <View style={[s.box, s.fill, { borderColor: tokens.border }]}>
              <Text style={[s.code, { color: tokens.brand }]}>+91</Text>
              <View style={[s.vline, { backgroundColor: tokens.border }]} />
              <TextInput
                style={[s.input, { color: tokens.text }]}
                placeholder={t("app.auth.enterPhoneNumber", "Enter Phone Number")}
                placeholderTextColor={tokens.muted}
                value={identifier}
                onChangeText={(v: string) => setIdentifier(v.replace(/\D/g, "").slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
                autoCorrect={false}
                accessibilityLabel={t("app.auth.enterPhoneNumber", "Enter Phone Number")}
                returnKeyType="done"
                onSubmitEditing={() => canContinue && handleContinueWithOtp()}
              />
            </View>
          </View>
          )}

          <Pressable onPress={() => setRemember((r) => !r)} style={s.rememberRow} accessibilityRole="checkbox" accessibilityState={{ checked: remember }}>
            <View style={[s.check, { borderColor: remember ? tokens.brand : tokens.text, backgroundColor: remember ? tokens.brand : "transparent" }]}>
              {remember && <Ionicons name="checkmark" size={moderateScale(13)} color={tokens.onBrand} />}
            </View>
            <Text style={[s.rememberText, { color: tokens.text }]}>{t("app.auth.rememberLogin", "Remember my login for faster sign-in")}</Text>
          </Pressable>

          <Pressable
            onPress={onContinue}
            disabled={!canContinue || busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue || busy, busy }}
            style={({ pressed }) => [
              s.cta,
              { backgroundColor: canContinue ? tokens.brand : tokens.muted },
              pressed && canContinue && { backgroundColor: tokens.brandPressed },
            ]}
          >
            {busy ? <ActivityIndicator color={tokens.onBrand} /> : <Text style={[s.ctaText, { color: tokens.onBrand }]}>{t("actions.continue")}</Text>}
          </Pressable>

          <Pressable onPress={() => setEmailMode((m) => !m)} hitSlop={8} style={s.altRow} accessibilityRole="button">
            <Ionicons name={emailMode ? "call-outline" : "mail-outline"} size={moderateScale(18)} color={tokens.brand} />
            <Text style={[s.altText, { color: tokens.brand }]}>
              {emailMode ? t("app.auth.continueWithPhone", "Continue with phone number") : t("app.auth.continueWithEmail", "Continue with email")}
            </Text>
          </Pressable>

          <Text style={[s.legal, { color: tokens.text }]}>{t("app.auth.byContinuing", "By continuing, you agree to our")}</Text>
          <View style={s.legalLinks}>
            {[
              t("app.auth.terms", "Terms of Service"),
              t("app.auth.privacy", "Privacy Policy"),
              t("app.auth.content", "Content Policy"),
            ].map((label, i) => (
              <View key={label} style={s.legalItem}>
                {i > 0 && <Text style={[s.legalSep, { color: tokens.text }]}>|</Text>}
                <Pressable onPress={() => soon(label)} hitSlop={6} accessibilityRole="link">
                  <Text style={[s.legalLink, { color: tokens.brand }]}>{label}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Reanimated.View>
      </ScrollView>
      </View>
    </View>
  );
}

const ms = moderateScale;

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  skip: { position: "absolute", right: ms(14), paddingHorizontal: ms(16), paddingVertical: ms(7), borderRadius: ms(18) },
  skipText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium },
  // The card takes the remaining 43%; its rounded top corners overlap the artwork a little.
  sheetWrap: { flex: 1, marginTop: -ms(20), borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), overflow: "hidden" },
  sheet: {
    flexGrow: 1,
    paddingTop: ms(16),
    paddingHorizontal: ms(14),
  },
  title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, lineHeight: typography.lineHeights.large, textAlign: "center" },
  sub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, textAlign: "center", marginTop: 4, marginBottom: ms(14) },
  phoneRow: { flexDirection: "row", gap: ms(6) },
  box: { height: ms(44), borderWidth: 1, borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: ms(12), gap: ms(8) },
  country: { width: ms(76), justifyContent: "space-between" },
  fill: { flex: 1 },
  flag: { fontSize: ms(22) }, // eslint-disable-line flavour/typography-tokens
  code: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  vline: { width: 1, height: ms(22) },
  input: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, paddingVertical: 0 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: ms(10), marginTop: ms(10), minHeight: 32 },
  check: { width: ms(18), height: ms(18), borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  rememberText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small },
  cta: { marginTop: ms(8), minHeight: ms(40), borderRadius: 8, alignItems: "center", justifyContent: "center" },
  ctaText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  altRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: ms(8), marginTop: ms(14), minHeight: 36 },
  altText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small },
  legal: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, textAlign: "center", marginTop: ms(22) },
  legalLinks: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: 8 },
  legalItem: { flexDirection: "row", alignItems: "center" },
  legalSep: { marginHorizontal: ms(12), fontSize: typography.sizes.small },
  legalLink: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, textDecorationLine: "underline" },
});
