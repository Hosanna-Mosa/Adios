import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./ErrorFallback.styles";

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
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>Error Details</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close error details"
              accessibilityRole="button"
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={[styles.modalScrollContent, { paddingBottom: bottomInset + 16 }]}
            showsVerticalScrollIndicator
          >
            <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Text
                style={[styles.errorText, { color: theme.text, fontFamily: monoFont }]}
                selectable
              >
                {details}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
