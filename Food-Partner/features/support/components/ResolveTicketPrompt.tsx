import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { SupportTicket } from "@/types/models";
import type { SupportChatStyles } from "../support-chat.styles";

interface Props {
  ticket: SupportTicket;
  onResolve: (approve: boolean) => void;
  styles: SupportChatStyles;
}

/** Support asked to close the case — the partner confirms or keeps it open. */
export function ResolveTicketPrompt({ ticket, onResolve, styles }: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={ticket.status === "PENDING_RESOLVE"}
      onClose={() => onResolve(false)}
      title={t("support.markResolvedTitle")}
      subtitle={t("support.markResolvedSubtitle")}
    >
      <View style={styles.sheetActions}>
        <Button title={t("support.notYet")} variant="secondary" onPress={() => onResolve(false)} style={styles.flex} />
        <Button title={t("support.yesResolved")} onPress={() => onResolve(true)} style={styles.flex} />
      </View>
    </BottomSheet>
  );
}
