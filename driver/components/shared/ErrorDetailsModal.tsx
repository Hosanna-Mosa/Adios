import React from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { styles } from "./ErrorFallback.styles";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";

/** Development-only sheet showing the raw error and stack.
 * Rendered by ErrorFallback; never shown in a release build. */
export function ErrorDetailsModal({
  visible,
  onClose,
  details,
  theme,
  isDark,
  monoFont,
  bottomInset,
}: {
  visible: boolean;
  onClose: () => void;
  details: string;
  theme: { text: string; background: string; backgroundSecondary: string };
  isDark: boolean;
  monoFont: string | undefined;
  bottomInset: number;
}) {
  const { t } = useTranslation();
  return (
    <ModalBox visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Box style={styles.modalOverlay}>
        <Box style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <Box
            style={[
              styles.modalHeader,
              {
                borderBottomColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <AppText style={[styles.modalTitle, { color: theme.text }]}>{t("errors.errorDetails")}</AppText>
            <PressBox
              onPress={onClose}
              accessibilityLabel={t("errors.closeErrorDetails")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="x" size={24} color={theme.text} />
            </PressBox>
          </Box>

          <ScrollBox
            style={styles.modalScrollView}
            contentContainerStyle={[styles.modalScrollContent, { paddingBottom: bottomInset + 16 }]}
            showsVerticalScrollIndicator
          >
            <Box style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <AppText
                style={[styles.errorText, { color: theme.text, fontFamily: monoFont }]}
                selectable
              >
                {details}
              </AppText>
            </Box>
          </ScrollBox>
        </Box>
      </Box>
    </ModalBox>
  );
}
