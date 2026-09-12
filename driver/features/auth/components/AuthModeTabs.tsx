import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../auth.styles";

export type AuthMode = "signin" | "signup";

/** Sign In / Sign Up switch at the top of the auth form. */
export function AuthModeTabs({
  mode,
  onSwitchMode,
}: {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}) {
  return (
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
  );
}
