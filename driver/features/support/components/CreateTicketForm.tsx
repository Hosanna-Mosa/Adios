import React from "react";
import { Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AppTextInput } from "@/components/ui/AppTextInput";

const CATEGORIES: { label: string; value: string }[] = [
  { label: "Operational Issue", value: "OPERATIONAL ISSUE" },
  { label: "Delayed Delivery", value: "DELAYED DELIVERY" },
  { label: "Quality Control", value: "QUALITY CONTROL" },
  { label: "Payout Adjustment", value: "BILLING ADJUSTMENT" },
];

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
  const pickCategory = () => {
    Alert.alert("Select Category", "Choose the most relevant category:", [
      ...CATEGORIES.map((c) => ({ text: c.label, onPress: () => onCategoryChange(c.value) })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  return (
    <Box style={styles.formContainer}>
      <AppText style={[styles.label, { color: Colors.textSecondary }]}>Issue Category</AppText>
      <Box style={[styles.pickerContainer, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
        <AppTextInput style={{ display: "none" }} />
        <Touchable style={styles.pickerButton} onPress={pickCategory}>
          <AppText style={{ color: Colors.text, fontWeight: "600" }}>{category}</AppText>
          <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
        </Touchable>
      </Box>

      <AppText style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>Summary / Title</AppText>
      <AppTextInput
        style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder="e.g. Weekly payout delayed"
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={onTitleChange}
        maxLength={60}
      />

      <AppText style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>Describe your issue</AppText>
      <AppTextInput
        style={[styles.textArea, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder="Tell us what went wrong. Include order number, item detail, or billing adjustments needed..."
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
          <AppText style={styles.submitBtnText}>Start Live Chat</AppText>
        )}
      </Touchable>
    </Box>
  );
}
