import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { IconButton } from "./IconButton";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel: string;
  sending?: boolean;
  maxLength?: number;
}

/** The reply bar at the bottom of a chat: growing input + round send button. */
export function ChatComposer({ value, onChangeText, onSend, placeholder, sendLabel, sending, maxLength = 400 }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const canSend = !!value.trim() && !sending;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={tokens.muted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={maxLength}
        />
      </View>
      <IconButton
        icon="send"
        size={44}
        color={tokens.onBrand}
        background={tokens.brand}
        disabled={!canSend}
        onPress={onSend}
        accessibilityLabel={sendLabel}
      />
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: tokens.surface,
      borderTopWidth: 1,
      borderTopColor: tokens.border,
    },
    inputWrap: {
      flex: 1,
      backgroundColor: tokens.bg,
      borderWidth: 1,
      borderColor: tokens.borderStrong,
      borderRadius: 22,
      minHeight: moderateScale(44),
      maxHeight: 100,
      paddingHorizontal: 16,
      justifyContent: "center",
    },
    input: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      color: tokens.text,
      paddingVertical: 10,
    },
  });
