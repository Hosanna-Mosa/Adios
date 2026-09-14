import { Platform, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  driver: any;
  inputText: any;
  insets: any;
  partnerLabel: any;
  sendMessage: any;
  setInputText: any;
  styles: any;
  tokens: any;
}

export function ChatInputBar({
  accent,
  driver,
  inputText,
  insets,
  partnerLabel,
  sendMessage,
  setInputText,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.inputBar, { paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 12 }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={t("app.support.messageVar", { value: driver?.name?.split(" ")[0] || partnerLabel })}
          placeholderTextColor={tokens.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={300}
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: accent.accent, opacity: inputText.trim() ? 1 : 0.5 }]}
        onPress={() => sendMessage(inputText)}
        disabled={!inputText.trim()}
      >
        <Ionicons name="send" size={18} color={accent.on} />
      </TouchableOpacity>
    </View>
  );
}
