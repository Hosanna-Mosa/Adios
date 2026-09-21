import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { fadeInUp } from "@/motion/presets";
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
  return (
    <Box style={styles.formSection}>
      <AuthModeTabs mode={mode} onSwitchMode={onSwitchMode} />

      <AppText style={styles.formTitle}>
        {mode === "signin" ? "Welcome Back!" : "Join as Driver"}
      </AppText>
      <AppText style={styles.formSubtitle}>
        {mode === "signin"
          ? "Sign in with your phone number and password"
          : "Create your account to start delivering"}
      </AppText>

      {/* Name field — sign up only */}
      {mode === "signup" && (
        <AnimatedBox entering={fadeInUp(0)}>
          <TextField
            label="Your Name"
            icon={<Feather name="user" size={18} color={Colors.brand} />}
            placeholder="Enter your full name"
            value={name}
            onChangeText={onNameChange}
            autoCapitalize="words"
          />
        </AnimatedBox>
      )}

      {/* Phone */}
      <AnimatedBox entering={fadeInUp(40)}>
        <TextField
          label="Phone Number"
          icon={
            <Box style={styles.countryCodeGroup}>
              <AppText style={styles.countryCode}>+91</AppText>
              <Box style={styles.phoneDivider} />
            </Box>
          }
          placeholder="Enter 10-digit number"
          value={phone}
          onChangeText={(t) => onPhoneChange(t.replace(/[^0-9]/g, "").slice(0, 10))}
          keyboardType="phone-pad"
        />
      </AnimatedBox>

      {/* Password */}
      <AnimatedBox entering={fadeInUp(80)}>
        <TextField
          label="Password"
          icon={<Feather name="lock" size={18} color={Colors.brand} />}
          placeholder={mode === "signin" ? "Enter your password" : "Create a password (6+ chars)"}
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
        />
      </AnimatedBox>

      {/* Confirm Password — sign up only */}
      {mode === "signup" && (
        <AnimatedBox entering={fadeInUp(120)}>
          <TextField
            label="Confirm Password"
            icon={<Feather name="shield" size={18} color={Colors.brand} />}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry
          />
        </AnimatedBox>
      )}

      {/* Submit button */}
      <Button
        title={
          loading
            ? mode === "signin" ? "Signing in..." : "Sending OTP..."
            : mode === "signin" ? "Sign In" : "Get OTP"
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
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </AppText>
      </Touchable>
    </Box>
  );
}
