import React from "react";
import { Modal, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";

type Presentation = "sheet" | "card";

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** `sheet` slides up from the bottom, `card` fades in centred. */
  presentation?: Presentation;
  /** Show the grab handle on a sheet. Ignored for `card`. */
  showHandle?: boolean;
  /** Tap outside to dismiss. Off by default so destructive confirms stay put. */
  dismissOnBackdropPress?: boolean;
  contentStyle?: ViewStyle;
}

/** The two modal shapes this app actually uses, in one component.
 *
 * Six files each wrote their own `<Modal>` plus overlay and container styles.
 * The values below are copied from those call sites unchanged — a sheet is the
 * slide-up bottom panel from GoOnlineModal, a card is the centred fade-in
 * dialog from the earnings and profile screens. */
export function AppModal({
  visible,
  onClose,
  children,
  presentation = "sheet",
  showHandle = true,
  dismissOnBackdropPress = false,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const isSheet = presentation === "sheet";

  const backdrop = (
    <View style={isSheet ? styles.sheetOverlay : styles.cardOverlay}>
      {isSheet ? (
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            contentStyle,
          ]}
        >
          {showHandle ? (
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
          ) : null}
          {children}
        </View>
      ) : (
        <View style={[styles.card, contentStyle]}>{children}</View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isSheet ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      {dismissOnBackdropPress ? (
        <Pressable style={styles.fill} onPress={onClose}>
          {/* Swallow taps on the panel itself so only the backdrop dismisses. */}
          <Pressable style={styles.fill} onPress={(e) => e.stopPropagation()}>
            {backdrop}
          </Pressable>
        </Pressable>
      ) : (
        backdrop
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handleRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(12),
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
