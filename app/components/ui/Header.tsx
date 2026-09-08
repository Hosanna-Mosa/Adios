import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

// The screen header: a circular surface-filled back chip, a left-aligned title,
// and an optional action on the right.
//
// This markup was moved verbatim out of the 31 screens that each carried their
// own identical copy, so adopting it changes nothing on screen — same 40pt chip,
// same 20pt chevron, same body.semibold 17 title, same TouchableOpacity press
// dimming.
//
// An earlier version of this file held a different, never-adopted design (bare
// icon button, centred heading.semibold 18 title, Pressable with no press
// feedback). It had no importers and was replaced rather than migrated to,
// because switching would have altered the back button, title alignment, title
// font and press feedback on every screen at once.
//
// No router import: ui/ primitives do not navigate on their own behalf, so the
// caller passes `onBack`. Omit `onBack` to hide the back button entirely.

interface Props {
  title?: string;
  /** Omit to hide the back button. Pass `() => router.back()` from the screen. */
  onBack?: () => void;
  /** Blocks the back button while an action is in flight. Matches
   * TouchableOpacity's own `disabled`, so the button looks the same at rest
   * and simply stops responding. */
  backDisabled?: boolean;
  /** Trailing action(s), rendered after the title. */
  right?: React.ReactNode;
  /** Per-screen spacing — usually a safe-area `paddingTop` when the screen root
   * does not already apply one. */
  style?: StyleProp<ViewStyle>;
  /** A reanimated entering animation, e.g. `fadeInDown(0)`. When omitted the
   * header renders as a plain View so nothing animates that did not before. */
  entering?: React.ComponentProps<typeof Animated.View>["entering"];
  accessibilityLabel?: string;
}

export function Header({
  title,
  onBack,
  backDisabled,
  right,
  style,
  entering,
  accessibilityLabel = "Go back",
}: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  const content = (
    <>
      {onBack ? (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          disabled={backDisabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
        </TouchableOpacity>
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {right}
    </>
  );

  if (entering) {
    return (
      <Animated.View style={[styles.row, style]} entering={entering}>
        {content}
      </Animated.View>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backBtn: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: fontFamilies.body.semibold,
      fontSize: moderateScale(17),
      color: tokens.text,
    },
  });
