import React from "react";
import { Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";

/** New support case: category, one-line summary, and the description. */
export function CreateTicketForm({
  category,
  onCategoryChange,
  title,
  onTitleChange,
  message,
  onMessageChange,
  submitting,
  onSubmit,
}: {
  category: string;
  onCategoryChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  // The `value` sent to the backend stays a fixed English enum; only `label`
  // (what the driver sees) is translated.
  const CATEGORIES: { label: string; value: string }[] = [
    { label: t("support.categories.operationalIssue"), value: "OPERATIONAL ISSUE" },
    { label: t("support.categories.delayedDelivery"), value: "DELAYED DELIVERY" },
    { label: t("support.categories.qualityControl"), value: "QUALITY CONTROL" },
    { label: t("support.categories.payoutAdjustment"), value: "BILLING ADJUSTMENT" },
  ];

  const pickCategory = () => {
    Alert.alert(t("support.selectCategory"), t("support.chooseTheMostRelevantCategory"), [
      ...CATEGORIES.map((c) => ({ text: c.label, onPress: () => onCategoryChange(c.value) })),
      { text: t("actions.cancel"), style: "cancel" as const },
    ]);
  };

  return (
    <Box style={styles.formContainer}>
      <AppText style={[styles.label, { color: Colors.textSecondary }]}>{t("support.issueCategory")}</AppText>
      <Box style={[styles.pickerContainer, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
        <AppTextInput style={{ display: "none" }} />
        <Touchable style={styles.pickerButton} onPress={pickCategory}>
          <AppText style={{ color: Colors.text, fontWeight: "600" }}>{category}</AppText>
          <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
        </Touchable>
      </Box>

      <AppText style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>{t("support.summaryTitle")}</AppText>
      <AppTextInput
        style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder={t("support.egWeeklyPayoutDelayed")}
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={onTitleChange}
        maxLength={60}
      />

      <AppText style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>{t("support.describeYourIssue")}</AppText>
      <AppTextInput
        style={[styles.textArea, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder={t("support.tellUsWhatWentWrong")}
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={onMessageChange}
        textAlignVertical="top"
      />

      <Touchable
        style={[styles.submitBtn, { backgroundColor: Colors.primary }, submitting && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <Loader color={Colors.white} />
        ) : (
          <AppText style={styles.submitBtnText}>{t("support.startLiveChat")}</AppText>
        )}
      </Touchable>
    </Box>
  );
}
