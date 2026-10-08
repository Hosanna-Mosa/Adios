import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type SupportChatStyles } from "@/features/support/support-chat.styles";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  isResolved: boolean;
  accent: ServiceTokens;
  handleReopen: any;
  handleSendMessage: () => void;
  inputText: string;
  insets: EdgeInsets;
  setInputText: any;
  setNewMessage: any;
  setNewTitle: any;
  setViewMode: any;
  styles: SupportChatStyles;
  submittingReply: any;
  ticket: any;
  tokens: ThemeTokens;
}

export function SupportChatBody({
  accent,
  handleReopen,
  handleSendMessage,
  inputText,
  insets,
  isResolved,
  setInputText,
  setNewMessage,
  setNewTitle,
  setViewMode,
  styles,
  submittingReply,
  ticket,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return isResolved ? (
    <View style={[styles.resolvedNotice, { paddingBottom: insets.bottom + 16 }]}>
      <Ionicons name="checkmark-circle" size={16} color={tokens.success} />
      <Text style={styles.resolvedText}>{t("app.support.thisCaseHasBeenMarkedResolved")}</Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
        <TouchableOpacity style={styles.reopenBtn} onPress={() => handleReopen(ticket)}>
          <Text style={[styles.reopenBtnText, { color: accent.accent }]}>{t("app.support.reopenCase")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reopenBtn, { backgroundColor: accent.accent, borderColor: accent.accent }]}
          onPress={() => { setNewTitle(""); setNewMessage(""); setViewMode("cases"); }}
        >
          <Text style={[styles.reopenBtnText, { color: accent.on }]}>{t("app.support.startNewChat")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={t("app.support.replyToSupport")}
          placeholderTextColor={tokens.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={400}
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: accent.accent, opacity: inputText.trim() && !submittingReply ? 1 : 0.5 }]}
        onPress={handleSendMessage}
        disabled={!inputText.trim() || submittingReply}
      >
        <Ionicons name="send" size={17} color={accent.on} />
      </TouchableOpacity>
    </View>
  );
}
