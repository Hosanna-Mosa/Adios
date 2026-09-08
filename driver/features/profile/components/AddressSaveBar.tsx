import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";

/** Pinned footer with the save/update action. */
export function AddressSaveBar({
  label,
  loading,
  onPress,
  paddingBottom,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
  paddingBottom: number;
}) {
  return (
    <View style={[styles.footer, { paddingBottom }]}>
      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.saveBtnText}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
