import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { ChatComposer } from "@/components/ui/ChatComposer";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportTicket } from "@/types/models";
import type { SupportChatStyles } from "../support-chat.styles";

interface Props {
  ticket: SupportTicket;
  inputText: string;
  setInputText: (text: string) => void;
  submittingReply: boolean;
  onSend: () => void;
  onReopen: (ticket: SupportTicket) => void;
  onStartNew: () => void;
  bottomInset: number;
  styles: SupportChatStyles;
  tokens: ThemeTokens;
}

/** The reply bar under a conversation, or — once resolved — reopen / start-new actions. */
export function SupportChatComposer(p: Props) {
  const { t } = useTranslation();
  if (p.ticket.status !== "RESOLVED") {
    return (
      <ChatComposer
        value={p.inputText}
        onChangeText={p.setInputText}
        onSend={p.onSend}
        sending={p.submittingReply}
        placeholder={t("support.replyPlaceholder")}
        sendLabel={t("support.send")}
      />
    );
  }
  return (
    <View style={[p.styles.resolvedBar, { paddingBottom: p.bottomInset + 16 }]}>
      <Ionicons name="checkmark-circle" size={18} color={p.tokens.success} />
      <Text style={p.styles.resolvedText}>{t("support.caseResolved")}</Text>
      <View style={p.styles.resolvedActions}>
        <Button title={t("support.reopenCase")} variant="secondary" size="sm" onPress={() => p.onReopen(p.ticket)} style={p.styles.flex} />
        <Button title={t("support.startNewChat")} size="sm" onPress={p.onStartNew} style={p.styles.flex} />
      </View>
    </View>
  );
}
