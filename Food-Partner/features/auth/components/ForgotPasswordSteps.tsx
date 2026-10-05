import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordField, TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { AuthStyles } from "../auth.styles";
import type { ForgotStep } from "../useForgotPassword";

interface Props {
  step: ForgotStep;
  email: string;
  setEmail: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  error?: string;
  sendOtp: () => void;
  verifyOtp: () => void;
  submitReset: () => void;
  styles: AuthStyles;
  tokens: ThemeTokens;
}

/** The card for the current reset step: email → code → new password → done. */
export function ForgotPasswordSteps(p: Props) {
  const { t } = useTranslation();
  const icon = (name: keyof typeof Ionicons.glyphMap) => <Ionicons name={name} size={18} color={p.tokens.muted} />;
  const eye = { showLabel: t("auth.showPassword"), hideLabel: t("auth.hidePassword") };

  return (
    <Animated.View key={p.step} entering={fadeInUp(40)}>
      <Card bordered elevationLevel="none" padding={18} style={p.styles.form}>
        {p.step === "email" ? (
          <>
            <TextField
              label={t("forgot.emailLabel")}
              placeholder={t("forgot.emailPlaceholder")}
              value={p.email}
              onChangeText={p.setEmail}
              error={p.error}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              onSubmitEditing={p.sendOtp}
              icon={icon("mail-outline")}
            />
            <Button title={t("forgot.sendCode")} onPress={p.sendOtp} loading={p.loading} fullWidth />
          </>
        ) : null}

        {p.step === "otp" ? (
          <>
            <TextField
              label={t("forgot.otpLabel")}
              placeholder="000000"
              value={p.otp}
              onChangeText={p.setOtp}
              error={p.error}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              onSubmitEditing={p.verifyOtp}
              icon={icon("keypad-outline")}
              style={{ letterSpacing: 6 }}
            />
            <Button title={t("actions.continue")} onPress={p.verifyOtp} fullWidth />
            <Button title={t("forgot.resendCode")} variant="link" onPress={p.sendOtp} disabled={p.loading} style={p.styles.centerLink} />
          </>
        ) : null}

        {p.step === "reset" ? (
          <>
            <PasswordField label={t("password.newLabel")} placeholder={t("password.newPlaceholder")} value={p.newPassword} onChangeText={p.setNewPassword} textContentType="newPassword" icon={icon("lock-closed-outline")} {...eye} />
            <PasswordField
              label={t("password.confirmLabel")}
              placeholder={t("password.confirmPlaceholder")}
              value={p.confirmPassword}
              onChangeText={p.setConfirmPassword}
              error={p.error}
              textContentType="newPassword"
              onSubmitEditing={p.submitReset}
              icon={icon("lock-closed-outline")}
              {...eye}
            />
            <Button title={t("forgot.resetPassword")} onPress={p.submitReset} loading={p.loading} fullWidth />
          </>
        ) : null}

        {p.step === "done" ? (
          <>
            <Text style={p.styles.footerText}>{t("forgot.doneHint")}</Text>
            <Button title={t("forgot.backToSignIn")} onPress={() => router.back()} fullWidth />
          </>
        ) : null}
      </Card>
    </Animated.View>
  );
}
