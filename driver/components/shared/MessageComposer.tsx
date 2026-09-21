import React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Touchable } from "@/components/ui/Touchable";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { Box } from "@/components/ui/Box";

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  paddingBottom: number;
  placeholder?: string;
  maxLength?: number;
  /** Blocks send while a message is in flight. */
  disabled?: boolean;
  testID?: string;
}

/** Message input plus send button.
 *
 * Replaces ChatComposer and SupportComposer, which were the same component
 * with drifted styling — the customer chat hard-coded a 44pt input while
 * support grew a min/max height for multiline, and the disabled send button
 * dimmed in one and greyed in the other. The multiline sizing wins. */
export function MessageComposer({
  value,
  onChangeText,
  onSend,
  paddingBottom,
  placeholder = "Type a message...",
  maxLength = 300,
  disabled = false,
  testID,
}: Props) {
  const canSend = !!value.trim() && !disabled;

  return (
    <Box style={[styles.inputBar, { paddingBottom }]} testID={testID}>
      <Box style={styles.inputContainer}>
        <AppTextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={maxLength}
        />
      </Box>
      <Touchable
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <Box style={styles.sendIcon}>
          <Feather name="send" size={moderateScale(19)} color={Colors.white} />
        </Box>
      </Touchable>
    </Box>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 22,
    minHeight: moderateScale(44),
    maxHeight: moderateScale(100),
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.medium,
    fontWeight: "500",
    color: Colors.text,
    paddingVertical: 8,
  },
  sendBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    transform: [{ rotate: "45deg" }],
  },
});
