import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeOut, modalSlideUp } from "@/motion/presets";

type ToastVariant = "success" | "error" | "info";
interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

const ToastContext = createContext<{ show: (message: string, variant?: ToastVariant) => void } | null>(null);

/** Mount once at the app root (see app/_layout.tsx). Renders whatever the
 * nearest ToastProvider is currently showing. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    if (timer.current) clearTimeout(timer.current);
    const id = ++nextId.current;
    setToast({ id, message, variant });
    timer.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastHost toast={toast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function ToastHost({ toast }: { toast: ToastState | null }) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  if (!toast) return null;

  const iconFor: Record<ToastVariant, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    success: { name: "checkmark-circle", color: tokens.success },
    error: { name: "alert-circle", color: tokens.error },
    info: { name: "information-circle", color: tokens.brand },
  };
  const { name, color } = iconFor[toast.variant];

  return (
    <Animated.View
      key={toast.id}
      entering={modalSlideUp}
      exiting={fadeOut}
      style={[styles.wrap, { top: insets.top + 8 }]}
      pointerEvents="none"
    >
      <Ionicons name={name} size={moderateScale(20)} color={color} />
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: tokens.surface,
      borderRadius: radius.md,
      paddingHorizontal: 16,
      paddingVertical: 14,
      ...elevation.lg,
    },
    message: {
      flex: 1,
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.medium,
      color: tokens.text,
    },
  });
