import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../auth.styles";

export type AuthMode = "signin" | "signup";

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
    <View style={styles.formSection}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, mode === "signin" && styles.tabActive]}
          onPress={() => onSwitchMode("signin")}
        >
          <Text style={[styles.tabText, mode === "signin" && styles.tabTextActive]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === "signup" && styles.tabActive]}
          onPress={() => onSwitchMode("signup")}
        >
          <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.formTitle}>
        {mode === "signin" ? "Welcome Back!" : "Join as Driver"}
      </Text>
      <Text style={styles.formSubtitle}>
        {mode === "signin"
          ? "Sign in with your phone number and password"
          : "Create your account to start delivering"}
      </Text>

      {/* Name field — sign up only */}
      {mode === "signup" && (
        <Animated.View entering={fadeInUp(0)}>
          <TextField
            label="Your Name"
            icon={<Feather name="user" size={18} color={Colors.brand} />}
            placeholder="Enter your full name"
            value={name}
            onChangeText={onNameChange}
            autoCapitalize="words"
          />
        </Animated.View>
      )}

      {/* Phone */}
      <Animated.View entering={fadeInUp(40)}>
        <TextField
          label="Phone Number"
          icon={
            <View style={styles.countryCodeGroup}>
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.phoneDivider} />
            </View>
          }
          placeholder="Enter 10-digit number"
          value={phone}
          onChangeText={(t) => onPhoneChange(t.replace(/[^0-9]/g, "").slice(0, 10))}
          keyboardType="phone-pad"
        />
      </Animated.View>

      {/* Password */}
      <Animated.View entering={fadeInUp(80)}>
        <TextField
          label="Password"
          icon={<Feather name="lock" size={18} color={Colors.brand} />}
          placeholder={mode === "signin" ? "Enter your password" : "Create a password (6+ chars)"}
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
        />
      </Animated.View>

      {/* Confirm Password — sign up only */}
      {mode === "signup" && (
        <Animated.View entering={fadeInUp(120)}>
          <TextField
            label="Confirm Password"
            icon={<Feather name="shield" size={18} color={Colors.brand} />}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            secureTextEntry
          />
        </Animated.View>
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
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => onSwitchMode(mode === "signin" ? "signup" : "signin")}
      >
        <Text style={styles.switchText}>
          {mode === "signin"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
