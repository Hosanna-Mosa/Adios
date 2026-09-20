import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile-tab.styles";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";

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
      <Box style={styles.modalOverlay}>
        <Box style={styles.modalCard}>
          <Box style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            <PressBox style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={18} color={Colors.text} />
            </PressBox>
          </Box>
          <ScrollBox style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollBox>
        </Box>
      </Box>
    </ModalBox>
  );
}
