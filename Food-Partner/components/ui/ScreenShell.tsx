import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
// react-native-keyboard-controller's version, not React Native's — see the
// customer app's ScreenShell: RN's own has no working Android behaviour.
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// The outer frame every screen repeats: a full-height surface on the theme
// background, optionally lifting above the keyboard, optionally scrolling.
// Same component as the customer app's, plus two things every partner screen
// would otherwise rebuild: pull-to-refresh and a footer bar pinned under the
// scroll area (for a screen's main action, e.g. "Save changes").

interface Props {
  children: React.ReactNode;
  /** Merged over the default frame — only needed for a non-standard screen. */
  style?: StyleProp<ViewStyle>;
  /** Lift content above the keyboard, as forms and chat screens do. */
  keyboardAvoiding?: boolean;
  /** Wrap the children in a ScrollView. */
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  /** Style of the scroll content (padding, gaps). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Pull-to-refresh, themed with the brand colour. Needs `scroll`. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Pinned above the scroll area — usually a ui/Header, so it stays put while content scrolls. */
  header?: React.ReactNode;
  /** Pinned below the scroll area, inside a surface bar above the home indicator. */
  footer?: React.ReactNode;
}

export function ScreenShell({
  children,
  style,
  keyboardAvoiding = false,
  scroll = false,
  scrollProps,
  contentStyle,
  refreshing,
  onRefresh,
  header,
  footer,
}: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const frame: StyleProp<ViewStyle> = [{ flex: 1, backgroundColor: tokens.bg }, style];

  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={contentStyle}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={tokens.brand} colors={[tokens.brand]} /> : undefined
      }
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const content = (
    <>
      {header}
      {body}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View> : null}
    </>
  );

  if (keyboardAvoiding) {
    // "padding" on both platforms: the library implements it natively for Android
    // too, so the frame is padded by the keyboard's actual height and returns to
    // exactly zero when it closes.
    return (
      <KeyboardAvoidingView style={frame} behavior="padding">
        {content}
      </KeyboardAvoidingView>
    );
  }
  return <View style={frame}>{content}</View>;
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    footer: {
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: tokens.surface,
      borderTopWidth: 1,
      borderTopColor: tokens.border,
    },
  });
