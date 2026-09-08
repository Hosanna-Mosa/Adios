import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";

/** Pinned bottom action bar with a single primary button. */
export function SaveBar({
  label,
  onPress,
  disabled,
  saving,
  paddingBottom,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  saving: boolean;
  paddingBottom: number;
}) {
  return (
    <View style={[styles.bottomBar, { paddingBottom }]}>
      <Pressable
        style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {saving ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}
