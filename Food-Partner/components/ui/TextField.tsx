import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { TIMING_FAST } from "@/motion/presets";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  /** Leading icon, e.g. <Ionicons name="mail-outline" />. */
  icon?: React.ReactNode;
  /** Trailing element, e.g. a unit or a clear button. */
  right?: React.ReactNode;
  /** Grows with its content instead of staying one line tall. */
  multilineHeight?: number;
  /** Style of the outer wrapper (label + field + error), e.g. side margins. */
  containerStyle?: StyleProp<ViewStyle>;
}

/** Text input with an animated focus border and inline error state — the customer app's TextField, plus a trailing slot. */
export function TextField({ label, error, icon, right, multilineHeight, containerStyle, style, onFocus, onBlur, ...rest }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const focus = useSharedValue(0);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: focus.value > 0.5 ? tokens.brand : error ? tokens.error : tokens.border,
    borderWidth: 1 + focus.value,
  }));

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View
        style={[
          styles.field,
          multilineHeight ? { height: undefined, minHeight: multilineHeight, alignItems: "flex-start", paddingVertical: 12 } : null,
          animatedBorder,
        ]}
      >
        {icon}
        <TextInput
          {...rest}
          placeholderTextColor={tokens.muted}
          textAlignVertical={multilineHeight ? "top" : "center"}
          style={[styles.input, multilineHeight ? { minHeight: multilineHeight - 24 } : null, style]}
          onFocus={(e) => {
            focus.value = withTiming(1, TIMING_FAST);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, TIMING_FAST);
            onBlur?.(e);
          }}
        />
        {right}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

interface PasswordFieldProps extends Omit<Props, "secureTextEntry" | "right"> {
  showLabel: string;
  hideLabel: string;
}

/** A TextField with a show/hide eye toggle. */
export function PasswordField({ showLabel, hideLabel, ...rest }: PasswordFieldProps) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const [visible, setVisible] = React.useState(false);

  return (
    <TextField
      {...rest}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!visible}
      right={
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? hideLabel : showLabel}
        >
          <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={moderateScale(20)} color={tokens.muted} />
        </TouchableOpacity>
      }
    />
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      gap: 6,
    },
    label: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      color: tokens.sec,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: tokens.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: tokens.border,
      paddingHorizontal: moderateScale(14),
      height: moderateScale(50),
    },
    input: {
      flex: 1,
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      color: tokens.text,
      paddingVertical: 0,
    },
    error: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.error,
    },
  });
