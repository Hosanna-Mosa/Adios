import React from "react";
import { Platform } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";
import { KeyboardView } from "@/components/ui/KeyboardView";

/** Centred dialog that shows the details of one profile section.
 *
 * Kept on the profile tab's own styles rather than the shared AppModal —
 * its card padding and header row differ from the app-wide dialog, and this
 * refactor does not change how anything looks. */
export function ProfileSectionModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <ModalBox visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Box style={styles.modalCard}>
          <Box style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            <PressBox style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={Colors.text} />
            </PressBox>
          </Box>
          {/* Personal Info's edit fields and the relocated Change Password form
              both sit inside this modal — with no keyboard-avoidance at all,
              the last field(s) and the Save/Update button ended up hidden
              under the keyboard as soon as it opened. */}
          <ScrollBox
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollBox>
        </Box>
      </KeyboardView>
    </ModalBox>
  );
}
