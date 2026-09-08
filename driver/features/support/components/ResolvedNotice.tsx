import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

/** Footer for a closed ticket: reopen it, or begin a fresh case. */
export function ResolvedNotice({
  paddingBottom,
  onReopen,
  onStartNew,
}: {
  paddingBottom: number;
  onReopen: () => void;
  onStartNew: () => void;
}) {
  return (
    <View style={[styles.resolvedNotice, { backgroundColor: Colors.surface, paddingBottom }]}>
      <Feather name="check-circle" size={16} color={Colors.brand} />
      <Text style={[styles.resolvedText, { color: Colors.textSecondary }]}>
        This ticket has been marked as resolved.
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
        <TouchableOpacity style={[styles.reopenBtn, { borderColor: Colors.primary }]} onPress={onReopen}>
          <Text style={[styles.reopenBtnText, { color: Colors.primary }]}>Reopen Case</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reopenBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
          onPress={onStartNew}
        >
          <Text style={[styles.reopenBtnText, { color: Colors.white }]}>Start New Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
