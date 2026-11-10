import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useVoiceSearchStore } from "@/contexts/voiceSearchStore";
import { useVoiceRecognition, type VoiceError } from "@/utils/useVoiceRecognition";

// Bottom sheet opened by the mic beside the Home search bar. It listens, shows the words as they
// come in, and hands the final text to the Home search (see contexts/voiceSearchStore.ts).

const ms = moderateScale;

interface Props {
  visible: boolean;
  onClose: () => void;
  insets: EdgeInsets;
  tokens: ThemeTokens;
}

export function VoiceSearchSheet({ visible, onClose, insets, tokens }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const submit = useVoiceSearchStore((st) => st.submit);
  const pulse = useRef(new Animated.Value(0)).current;

  const { status, transcript, error, start, stop, cancel } = useVoiceRecognition((text) => {
    submit(text);
    onClose();
  });

  // Start listening each time the sheet opens; release the mic when it closes.
  useEffect(() => {
    if (visible) start();
    else cancel();
  }, [visible, start, cancel]);

  useEffect(() => {
    if (status !== "listening") {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const ringStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  };

  const message = (e: VoiceError) =>
    ({
      permission: t("app.home.voicePermission", "Allow microphone access to search by voice."),
      noSpeech: t("app.home.voiceNoSpeech", "Couldn't hear that. Try again."),
      network: t("app.home.voiceNetwork", "No internet connection. Check it and try again."),
      unavailable: t("app.home.voiceUnavailable", "Voice search isn't available on this phone."),
      other: t("app.home.voiceOther", "Something went wrong. Try again."),
    })[e];

  const title =
    status === "listening"
      ? transcript || t("app.home.voiceListening", "Listening...")
      : error
        ? message(error)
        : t("app.home.voiceListening", "Listening...");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("app.support.closeModal")} />
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 20 }]}>
          <View style={s.handle} />
          <Text style={s.title} accessibilityRole="header" accessibilityLiveRegion="polite" numberOfLines={3}>
            {title}
          </Text>
          {status === "listening" && !transcript && (
            <Text style={s.hint}>{t("app.home.voiceHint", "Say a dish or restaurant, like \"chicken biryani\"")}</Text>
          )}

          <View style={s.micWrap}>
            {status === "listening" && <Animated.View style={[s.ring, ringStyle]} />}
            <Pressable
              style={s.mic}
              onPress={status === "listening" ? stop : start}
              accessibilityRole="button"
              accessibilityLabel={status === "listening" ? t("app.home.voiceDone", "Done") : t("app.home.voiceSearch", "Search by voice")}
            >
              <Ionicons name={status === "listening" ? "mic" : "mic-outline"} size={ms(32)} color={tokens.onBrand} />
            </Pressable>
          </View>

          {error === "permission" ? (
            <Pressable style={s.action} onPress={() => Linking.openSettings()} accessibilityRole="button">
              <Text style={s.actionText}>{t("app.home.voiceOpenSettings", "Open settings")}</Text>
            </Pressable>
          ) : error && error !== "unavailable" ? (
            <Pressable style={s.action} onPress={start} accessibilityRole="button">
              <Text style={s.actionText}>{t("app.home.voiceTryAgain", "Try again")}</Text>
            </Pressable>
          ) : null}

          <Pressable style={s.cancel} onPress={onClose} accessibilityRole="button">
            <Text style={s.cancelText}>{t("actions.cancel", "Cancel")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.55)" },
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingHorizontal: ms(20), paddingTop: ms(10), alignItems: "center" },
    handle: { width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginBottom: ms(18) },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text, textAlign: "center", minHeight: ms(30) },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, textAlign: "center", marginTop: ms(6) },
    micWrap: { width: ms(120), height: ms(120), alignItems: "center", justifyContent: "center", marginVertical: ms(22) },
    ring: { position: "absolute", width: ms(72), height: ms(72), borderRadius: ms(36), backgroundColor: tokens.brand },
    mic: { width: ms(72), height: ms(72), borderRadius: ms(36), backgroundColor: tokens.brand, alignItems: "center", justifyContent: "center" },
    action: { minHeight: ms(46), paddingHorizontal: ms(24), borderRadius: ms(23), backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center", marginBottom: ms(6) },
    actionText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.brand },
    cancel: { minHeight: ms(44), paddingHorizontal: ms(24), alignItems: "center", justifyContent: "center" },
    cancelText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
  });
