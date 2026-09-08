import React from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";

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
    <View style={styles.formContainer}>
      <Text style={[styles.label, { color: Colors.textSecondary }]}>Issue Category</Text>
      <View style={[styles.pickerContainer, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
        <TextInput style={{ display: "none" }} />
        <TouchableOpacity style={styles.pickerButton} onPress={pickCategory}>
          <Text style={{ color: Colors.text, fontWeight: "600" }}>{category}</Text>
          <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>Summary / Title</Text>
      <TextInput
        style={[styles.input, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder="e.g. Weekly payout delayed"
        placeholderTextColor={Colors.textMuted}
        value={title}
        onChangeText={onTitleChange}
        maxLength={60}
      />

      <Text style={[styles.label, { color: Colors.textSecondary, marginTop: 20 }]}>Describe your issue</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: Colors.surface, borderColor: Colors.border, color: Colors.text }]}
        placeholder="Tell us what went wrong. Include order number, item detail, or billing adjustments needed..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={onMessageChange}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: Colors.primary }, submitting && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitBtnText}>Start Live Chat</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
