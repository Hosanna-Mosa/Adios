import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { create } from "zustand";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles, iconFor } from "./AppAlert.styles";
import { StatusBarFill } from "@/components/StatusBarFill";

/**
 * The app's own alert, replacing React Native's `Alert.alert` — that one renders
 * the platform dialog, which ignores the design system entirely and looks like a
 * stock Android popup. Same call signature, so a call site only swaps the import:
 *
 *   showAlert("Missing fields", "All fields are required");
 *   showAlert("Clear cart?", "This removes every item.", [
 *     { text: "Cancel", style: "cancel" },
 *     { text: "Clear", style: "destructive", onPress: clear },
 *   ]);
 *
 * State lives in a module-level store rather than a context so it can be called
 * from plain handlers and hooks, exactly the way `Alert.alert` could. Mount
 * <AppAlert /> once at the app root (see app/_layout.tsx).
 */
export type AlertButtonStyle = "default" | "cancel" | "destructive";
export type AlertTone = "info" | "success" | "error" | "warning";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

interface AlertRequest {
  title: string;
  message?: string;
  buttons: AlertButton[];
  tone: AlertTone;
}

interface AlertState {
  current: AlertRequest | null;
  show: (request: AlertRequest) => void;
  dismiss: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  current: null,
  show: (request) => set({ current: request }),
  dismiss: () => set({ current: null }),
}));

const OK_BUTTON: AlertButton[] = [{ text: "OK" }];

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  tone: AlertTone = "info"
) {
  useAlertStore.getState().show({
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : OK_BUTTON,
    tone,
  });
}

export function AppAlert() {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [theme]);

  const current = useAlertStore((s) => s.current);
  const dismiss = useAlertStore((s) => s.dismiss);

  if (!current) return null;

  const icon = iconFor(tokens)[current.tone];

  const handlePress = (button: AlertButton) => {
    dismiss();
    button.onPress?.();
  };

  // Back / tapping outside resolves the way the platform dialog did: to the
  // cancel button if there is one, to the only button on a plain notice, and
  // otherwise not at all — a real choice has to be made deliberately.
  const cancelButton = current.buttons.find((b) => b.style === "cancel");
  const dismissButton = cancelButton || (current.buttons.length === 1 ? current.buttons[0] : null);
  const handleDismissGesture = () => (dismissButton ? handlePress(dismissButton) : undefined);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={handleDismissGesture}>
      <StatusBarFill />
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismissGesture} />
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: icon.skin }]}>
            <Ionicons name={icon.name} size={moderateScale(22)} color={icon.color} />
          </View>
          <Text style={styles.title}>{current.title}</Text>
          {!!current.message && <Text style={styles.message}>{current.message}</Text>}

          <View style={styles.buttons}>
            {current.buttons.map((button, index) => (
              <TouchableOpacity
                key={`${button.text}-${index}`}
                style={[
                  styles.button,
                  button.style === "cancel" && styles.buttonCancel,
                  button.style === "destructive" && styles.buttonDestructive,
                ]}
                activeOpacity={0.85}
                onPress={() => handlePress(button)}
              >
                <Text style={[styles.buttonText, button.style === "cancel" && styles.buttonTextCancel]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
