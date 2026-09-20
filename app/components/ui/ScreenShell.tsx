import React from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
// react-native-keyboard-controller's version, not React Native's. RN's
// KeyboardAvoidingView has no working Android behaviour: "height" shrinks the
// container by the keyboard height while Android's own adjustResize is already
// resizing the window, so the two stack — the composer sat under the navigation
// bar before the keyboard opened, and a dead grey band was left behind after it
// closed. The library (already installed, with KeyboardProvider mounted at the
// root of app/_layout.tsx) measures the real keyboard frame on both platforms.
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// The outer frame every screen repeats: a full-height surface on the theme
// background, optionally lifting above the keyboard, optionally scrolling.
//
// 31 of 33 screens declared an identical `root: { flex: 1, backgroundColor:
// tokens.bg }` and then chose between View and KeyboardAvoidingView by hand.
// That default lives here now; a screen with a genuinely different frame still
// passes its own `style`, which is merged on top.

interface Props {
  children: React.ReactNode;
  /** Merged over the default frame — only needed for a non-standard screen. */
  style?: StyleProp<ViewStyle>;
  /** Lift content above the keyboard, as forms and chat screens do. */
  keyboardAvoiding?: boolean;
  /** Wrap the children in a ScrollView. */
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}

export function ScreenShell({
  children,
  style,
  keyboardAvoiding = false,
  scroll = false,
  scrollProps,
}: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const frame: StyleProp<ViewStyle> = [{ flex: 1, backgroundColor: tokens.bg }, style];

  const body = scroll ? <ScrollView {...scrollProps}>{children}</ScrollView> : children;

  if (keyboardAvoiding) {
    // "padding" on both platforms: the library implements it natively for Android
    // too, so the frame is padded by the keyboard's actual height and returns to
    // exactly zero when it closes.
    return (
      <KeyboardAvoidingView style={frame} behavior="padding">
        {body}
      </KeyboardAvoidingView>
    );
  }
  return <View style={frame}>{body}</View>;
}
