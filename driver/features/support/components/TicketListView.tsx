import React from "react";

import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { TicketListItem } from "./TicketListItem";
import type { SupportTicket } from "../types";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { List } from "@/components/ui/List";

/** All of the driver's support cases, with a button to open a fresh one. */
export function TicketListView({
  tickets,
  paddingTop,
  onBack,
  onOpenTicket,
  onStartNew,
}: {
  tickets: SupportTicket[];
  paddingTop: number;
  onBack: () => void;
  onOpenTicket: (ticket: SupportTicket) => void;
  onStartNew: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={[styles.root, { backgroundColor: Colors.background }]}>
      <ScreenHeader title={t("support.supportSessions")} paddingTop={paddingTop} onBack={onBack} />

      <List
        data={tickets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <TicketListItem ticket={item} onPress={() => onOpenTicket(item)} />
        )}
        ListFooterComponent={() => (
          <Touchable
            style={[
              styles.submitBtn,
              { backgroundColor: Colors.primary, marginTop: 8, marginBottom: 24 },
            ]}
            onPress={onStartNew}
          >
            <AppText style={styles.submitBtnText}>{t("support.startNewSupportChat")}</AppText>
          </Touchable>
        )}
      />
    </Box>
  );
}
