import { Platform, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ChatStyles } from "@/features/support/useChat.shared";
import type { Driver } from "@/types/models";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  driver: Driver;
  inputText: string;
  insets: EdgeInsets;
  partnerLabel: string;
  sendMessage: any;
  setInputText: any;
  styles: ChatStyles;
  tokens: ThemeTokens;
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
    <View style={[styles.inputBar, { paddingBottom: Platform.OS === "ios" ? insets.bottom + 34 : 38 }]}>
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
