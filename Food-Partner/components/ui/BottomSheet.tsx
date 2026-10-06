import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeIn, modalSlideUp } from "@/motion/presets";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Blocks backdrop/back-button dismissal, e.g. while a request is in flight. */
  dismissible?: boolean;
}

/** A modal sheet that slides up from the bottom over a dimmed backdrop. */
export function BottomSheet({ visible, onClose, title, subtitle, children, dismissible = true }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const close = () => (dismissible ? onClose() : undefined);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        <Animated.View entering={fadeIn(0)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View entering={modalSlideUp} style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.handle} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.overlay,
    },
    sheet: {
      backgroundColor: tokens.surface,
      borderTopLeftRadius: radius.lg + 6,
      borderTopRightRadius: radius.lg + 6,
      paddingHorizontal: 20,
      paddingTop: 10,
      ...elevation.lg,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: tokens.borderStrong,
      marginBottom: 16,
    },
    title: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text,
    },
    subtitle: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginTop: 6,
    },
  });
