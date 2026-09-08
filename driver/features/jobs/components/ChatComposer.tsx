import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";

/** Message input plus the send button. */
export function ChatComposer({
  value,
  onChangeText,
  onSend,
  paddingBottom,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  paddingBottom: number;
}) {
  const canSend = !!value.trim();

  return (
    <View style={[styles.inputBar, { paddingBottom }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={300}
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        <View style={{ transform: [{ rotate: "45deg" }] }}>
          <Feather name="send" size={20} color={Colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
