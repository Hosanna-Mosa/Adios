import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

/** Shown when support has asked the driver to confirm the case is solved. */
export function ResolveRequestPrompt({
  paddingBottom,
  onApprove,
  onDecline,
}: {
  paddingBottom: number;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <View
      style={[
        styles.resolveRequestContainer,
        { backgroundColor: Colors.surface, paddingBottom, borderTopColor: Colors.border },
      ]}
    >
      <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
      <Text style={[styles.resolveRequestTitle, { color: Colors.text }]}>Resolve this ticket?</Text>
      <Text style={[styles.resolveRequestDesc, { color: Colors.textSecondary }]}>
        Support has requested to mark this case as resolved. Is your issue fully solved?
      </Text>
      <View style={styles.resolveRequestButtons}>
        <TouchableOpacity
          style={[styles.resolveBtnConfirm, { backgroundColor: Colors.brandPressed }]}
          onPress={onApprove}
        >
          <Text style={styles.resolveBtnTextConfirm}>Yes, Resolve Case</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resolveBtnDecline, { borderColor: Colors.primary }]}
          onPress={onDecline}
        >
          <Text style={[styles.resolveBtnTextDecline, { color: Colors.primary }]}>No, Keep Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
