import React from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { styles } from "./UpdateModal.styles";
import { Colors } from "@/constants/colors";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";

interface UpdateModalProps {
  visible: boolean;
  forceUpdate: boolean;
  storeUrl: string;
  onDismiss: () => void;
}

export default function UpdateModal({ visible, forceUpdate, storeUrl, onDismiss }: UpdateModalProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  const handleUpdate = () => {
    Linking.openURL(storeUrl).catch(err => console.error("Failed to open store URL:", err));
  };

  return (
    <ModalBox
      visible={visible}
      transparent={true}
      animationType="fade"
      hardwareAccelerated={true}
      onRequestClose={() => {
        onDismiss();
      }}
    >
      <Box style={styles.overlay}>
        <Box style={styles.card}>
          <Box style={styles.iconContainer}>
            <Feather name="download-cloud" size={40} color={Colors.white} />
          </Box>

          <AppText style={styles.title}>{t("errors.newDriverAppVersion")}</AppText>
          <AppText style={styles.subtitle}>{t("errors.updateFlavourDriverToContinue")}</AppText>

          {forceUpdate && (
            <Box style={styles.warningContainer}>
              <Feather name="alert-triangle" size={16} color="#ef4444" />
              <AppText style={styles.warningText}>{t("errors.updateMandatoryToContinueOnlineDuties")}</AppText>
            </Box>
          )}

          <Box style={styles.buttonContainer}>
            <Touchable style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.85}>
              <AppText style={styles.updateText}>{t("errors.updateNow")}</AppText>
            </Touchable>

            <Touchable style={styles.laterButton} onPress={onDismiss} activeOpacity={0.8}>
              <AppText style={styles.laterText}>{t("errors.maybeLater")}</AppText>
            </Touchable>
          </Box>
        </Box>
      </Box>
    </ModalBox>
  );
}
