import React, { useState } from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { fadeInUp } from "@/motion/presets";
import {
  fieldMessage,
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validatePersonName,
  validatePhone,
  type ValidationCode,
} from "@/utils/validation";
import { AuthModeTabs, type AuthMode } from "./AuthModeTabs";
import { styles } from "../auth.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

interface Props {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
  name: string;
  onNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (v: string) => void;
  loading: boolean;
  onSignIn: () => void;
  onSendOTP: () => void;
}

/** Sign-in / sign-up form: mode tabs, the credential fields, and the submit row. */
export function AuthForm({
  mode,
  onSwitchMode,
  name,
  onNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  loading,
  onSignIn,
  onSendOTP,
}: Props) {
  const { t } = useTranslation();
  const signup = mode === "signup";

  // A field is judged after the driver has left it once, so the form isn't red on arrival.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (key: string) => () => setTouched((prev) => ({ ...prev, [key]: true }));
  const error = (key: string, code: ValidationCode | null) => (touched[key] ? fieldMessage(t, code) : undefined);

  return (
    <Box style={styles.formSection}>
      <AuthModeTabs mode={mode} onSwitchMode={onSwitchMode} />

      <AppText style={styles.formTitle}>
        {mode === "signin" ? t("auth.welcomeBack") : t("auth.joinAsDriver")}
      </AppText>
      <AppText style={styles.formSubtitle}>
        {mode === "signin"
          ? t("auth.signInWithYourPhoneNumberAndPassword")
          : t("auth.createYourAccountToStartDelivering")}
      </AppText>

      {/* Name field — sign up only */}
      {mode === "signup" && (
        <AnimatedBox entering={fadeInUp(0)}>
          <TextField
            label={t("auth.yourName")}
            icon={<Feather name="user" size={18} color={Colors.brand} />}
            placeholder={t("auth.enterYourFullName")}
            value={name}
            onChangeText={onNameChange}
            autoCapitalize="words"
            maxLength={60}
            onBlur={touch("name")}
            error={error("name", validatePersonName(name))}
          />
        </AnimatedBox>
      )}

      {/* Email — sign up only; review outcomes are emailed here */}
      {mode === "signup" && (
        <AnimatedBox entering={fadeInUp(20)}>
          <TextField
            label={t("auth.emailAddress", "Email address")}
            icon={<Feather name="mail" size={18} color={Colors.brand} />}
            placeholder={t("auth.enterYourEmail", "you@example.com")}
            value={email}
            onChangeText={(v) => onEmailChange(v.replace(/\s/g, ""))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={254}
            onBlur={touch("email")}
            error={error("email", validateEmail(email))}
          />
        </AnimatedBox>
      )}

      {/* Phone */}
      <AnimatedBox entering={fadeInUp(40)}>
        <TextField
          label={t("auth.phoneNumber")}
          icon={
            <Box style={styles.countryCodeGroup}>
              <AppText style={styles.countryCode}>+91</AppText>
              <Box style={styles.phoneDivider} />
            </Box>
          }
          placeholder={t("auth.enter10DigitNumber")}
          value={phone}
          onChangeText={(t) => onPhoneChange(t.replace(/[^0-9]/g, "").slice(0, 10))}
          keyboardType="phone-pad"
          maxLength={10}
          onBlur={touch("phone")}
          error={error("phone", validatePhone(phone))}
        />
      </AnimatedBox>

      {/* Password */}
      <AnimatedBox entering={fadeInUp(80)}>
        <TextField
          label={t("auth.password")}
          icon={<Feather name="lock" size={18} color={Colors.brand} />}
          placeholder={mode === "signin" ? t("auth.enterYourPassword") : t("auth.createAPassword6Chars")}
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          maxLength={64}
          onBlur={touch("password")}
          // Sign-in only needs a password; the strength rules are for choosing a new one.
          error={error("password", signup ? validateNewPassword(password) : password ? null : "passwordRequired")}
        />
      </AnimatedBox>

      {/* Confirm Password — sign up only */}
      {mode === "signup" && (
        <AnimatedBox entering={fadeInUp(120)}>
          <TextField
            label={t("auth.confirmPassword")}
            icon={<Feather name="shield" size={18} color={Colors.brand} />}
            placeholder={t("auth.reEnterYourPassword")}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry
            maxLength={64}
            onBlur={touch("confirm")}
            error={error("confirm", validateConfirmPassword(password, confirmPassword))}
          />
        </AnimatedBox>
      )}

      {/* Submit button */}
      <Button
        title={
          loading
            ? mode === "signin" ? t("auth.signingIn") : t("auth.sendingOtp")
            : mode === "signin" ? t("auth.signIn") : t("auth.getOtp")
        }
        onPress={mode === "signin" ? onSignIn : onSendOTP}
        loading={loading}
        icon={!loading ? <Feather name={mode === "signin" ? "log-in" : "arrow-right"} size={18} color={Colors.onBrand} /> : undefined}
        fullWidth
        style={{ marginTop: 4 }}
      />

      {/* Bottom switch hint */}
      <Touchable
        style={styles.switchButton}
        onPress={() => onSwitchMode(mode === "signin" ? "signup" : "signin")}
      >
        <AppText style={styles.switchText}>
          {mode === "signin"
            ? t("auth.dontHaveAnAccountSignUp")
            : t("auth.alreadyHaveAnAccountSignIn")}
        </AppText>
      </Touchable>
    </Box>
  );
}
