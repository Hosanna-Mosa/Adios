import { Feather } from "@expo/vector-icons";
import { reloadAppAsync } from "expo";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./ErrorFallback.styles";
import { ErrorDetailsModal } from "./ErrorDetailsModal";
import { formatErrorDetails, useErrorFallbackTheme } from "./ErrorFallback.theme";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, theme, monoFont } = useErrorFallbackTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  return (
    <Box style={[styles.container, { backgroundColor: theme.background }]}>
      {__DEV__ ? (
        <ErrorDetailsModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          details={formatErrorDetails(error)}
          theme={theme}
          isDark={isDark}
          monoFont={monoFont}
          bottomInset={insets.bottom}
        />
      ) : null}

      <Box style={styles.content}>
        <AppText style={[styles.title, { color: theme.text }]}>
          {t("errors.somethingWentWrong")}
        </AppText>

        <AppText style={[styles.message, { color: theme.textSecondary }]}>
          {t("errors.pleaseReloadTheAppToContinue")}
        </AppText>

        <PressBox
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.link,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <AppText style={[styles.buttonText, { color: theme.buttonText }]}>
            {t("errors.tryAgain")}
          </AppText>
        </PressBox>
      </Box>

      {__DEV__ ? (
        <ModalBox
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <Box style={styles.modalOverlay}>
            <Box
              style={[
                styles.modalContainer,
                { backgroundColor: theme.background },
              ]}
            >
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
                <AppText style={[styles.modalTitle, { color: theme.text }]}>
                  {t("errors.errorDetails")}
                </AppText>
                <PressBox
                  onPress={() => setIsModalVisible(false)}
                  accessibilityLabel={t("errors.closeErrorDetails")}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.closeButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="x" size={24} color={theme.text} />
                </PressBox>
              </Box>

              <ScrollBox
                style={styles.modalScrollView}
                contentContainerStyle={[
                  styles.modalScrollContent,
                  { paddingBottom: insets.bottom + 16 },
                ]}
                showsVerticalScrollIndicator
              >
                <Box
                  style={[
                    styles.errorContainer,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <AppText
                    style={[
                      styles.errorText,
                      {
                        color: theme.text,
                        fontFamily: monoFont,
                      },
                    ]}
                    selectable
                  >
                    {formatErrorDetails(error)}
                  </AppText>
                </Box>
              </ScrollBox>
            </Box>
          </Box>
        </ModalBox>
      ) : null}
    </Box>
  );
}
