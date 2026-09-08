import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

/** Message box and send button for an open ticket. */
export function SupportComposer({
  value,
  onChangeText,
  onSend,
  sending,
  paddingBottom,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  sending: boolean;
  paddingBottom: number;
}) {
  const canSend = !!value.trim();

  return (
    <View style={[styles.inputBar, { paddingBottom, borderTopColor: Colors.border }]}>
      <View style={[styles.inputContainer, { backgroundColor: Colors.surface }]}>
        <TextInput
          style={[styles.textInput, { color: Colors.text }]}
          placeholder="Type a message to Support..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={400}
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: Colors.primary }, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend || sending}
      >
        <View style={{ transform: [{ rotate: "45deg" }] }}>
          <Feather name="send" size={18} color={Colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
