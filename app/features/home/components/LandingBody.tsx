import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { LandingFieldWrapper } from "./LandingFieldWrapper";
import { LandingForgotRow } from "./LandingForgotRow";
import { LandingFieldWrapper2 } from "./LandingFieldWrapper2";
import { LandingLogoMark } from "./LandingLogoMark";
import { Button } from "@/components/ui/Button";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  Reanimated: any;
  handleContinueWithOtp: any;
  handleForgotPassword: any;
  handleSignIn: any;
  identifier: any;
  insets: any;
  isPasswordVisible: any;
  loading: any;
  password: any;
  sendingOtp: any;
  setIdentifier: any;
  setIsPasswordVisible: any;
  setPassword: any;
  styles: any;
  tokens: any;
}

export function LandingBody({
  Reanimated,
  handleContinueWithOtp,
  handleForgotPassword,
  handleSignIn,
  identifier,
  insets,
  isPasswordVisible,
  loading,
  password,
  sendingOtp,
  setIdentifier,
  setIsPasswordVisible,
  setPassword,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 24, minHeight: "100%" }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Brand mark + headline, centered in the space above the form */}
      <Reanimated.View style={styles.heroBlock} entering={fadeInUp(0)}>
        <LandingLogoMark
          styles={styles}
        />

        <Text style={styles.headline} numberOfLines={1}>{t("app.home.welcomeBack")}</Text>
        <Text style={styles.subhead}>
          {t("app.home.foodMeatRidesHelpersAndCourier")}
        </Text>
      </Reanimated.View>

      {/* Form */}
      <Reanimated.View style={styles.form} entering={fadeInUp(90)}>
        <LandingFieldWrapper
          identifier={identifier}
          setIdentifier={setIdentifier}
          styles={styles}
          tokens={tokens}
        />

        <LandingFieldWrapper2
          isPasswordVisible={isPasswordVisible}
          password={password}
          setIsPasswordVisible={setIsPasswordVisible}
          setPassword={setPassword}
          styles={styles}
          tokens={tokens}
        />

        <LandingForgotRow
          handleForgotPassword={handleForgotPassword}
          styles={styles}
        />

        {/* Sign In CTA */}
        <Button
          title={t("app.auth.signIn")}
          onPress={handleSignIn}
          disabled={!identifier || !password}
          loading={loading}
          fullWidth
          style={{ marginTop: 4 }}
        />
      </Reanimated.View>

      {/* Divider */}
      <Reanimated.View style={styles.dividerRow} entering={fadeInUp(160)}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t("app.home.or")}</Text>
        <View style={styles.dividerLine} />
      </Reanimated.View>

      {/* OTP alternative */}
      <Reanimated.View entering={fadeInUp(200)} style={{ marginTop: 16 }}>
        <Button
          title={t("app.home.continueWithOtpInstead")}
          onPress={handleContinueWithOtp}
          loading={sendingOtp}
          variant="secondary"
          fullWidth
        />
      </Reanimated.View>

      {/* Create account link */}
      <Reanimated.View entering={fadeInUp(240)}>
        <TouchableOpacity
          onPress={() => router.replace("/signup")}
          activeOpacity={0.7}
          style={styles.signUpLinkRow}
        >
          <Text style={styles.signUpLinkText}>
            {t("app.home.newHere")} <Text style={styles.signUpLinkHighlight}>{t("app.home.createAnAccount")}</Text>
          </Text>
        </TouchableOpacity>
      </Reanimated.View>
    </ScrollView>
    </>
  );
}
