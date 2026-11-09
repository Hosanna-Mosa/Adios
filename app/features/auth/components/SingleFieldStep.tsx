import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

// A sign-up step that asks for one thing: a title, a line of help, one field and Continue.
// Used by "enter your name" (after a phone code) and "enter your phone number" (after an
// email code).

interface Props {
  title: string;
  subtitle: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  /** Shown in the field's left, e.g. "+91". */
  prefix?: string;
  canSubmit: boolean;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
  inputProps?: TextInputProps;
}

export function SingleFieldStep({ title, subtitle, value, onChangeText, placeholder, prefix, canSubmit, loading, onSubmit, onBack, inputProps }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const ms = moderateScale;

  return (
    <KeyboardAvoidingView style={[s.root, { backgroundColor: tokens.bg }]} behavior="padding">
      <View style={[s.header, { paddingTop: insets.top + 4 }]}>
        <Pressable onPress={onBack} hitSlop={8} style={s.back} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
          <Ionicons name="chevron-back" size={ms(24)} color={tokens.text} />
        </Pressable>
      </View>

      <View style={s.body}>
        <Text style={[s.title, { color: tokens.brand }]} accessibilityRole="header">{title}</Text>
        <Text style={[s.sub, { color: tokens.sec }]}>{subtitle}</Text>

        <View style={[s.field, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          {prefix ? (
            <>
              <Text style={[s.prefix, { color: tokens.brand }]}>{prefix}</Text>
              <View style={[s.vline, { backgroundColor: tokens.border }]} />
            </>
          ) : null}
          <TextInput
            style={[s.input, { color: tokens.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={tokens.muted}
            autoFocus
            accessibilityLabel={placeholder}
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && onSubmit()}
            {...inputProps}
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit || loading}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit || loading, busy: loading }}
          style={({ pressed }) => [
            s.cta,
            { backgroundColor: canSubmit ? tokens.brand : tokens.muted },
            pressed && canSubmit && { backgroundColor: tokens.brandPressed },
          ]}
        >
          {loading ? <ActivityIndicator color={tokens.onBrand} /> : <Text style={[s.ctaText, { color: tokens.onBrand }]}>{t("actions.continue")}</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const ms = moderateScale;
const s = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: ms(12) },
  back: { width: ms(40), height: ms(40), alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: ms(20), paddingTop: ms(24) },
  title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge },
  sub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, marginTop: ms(8), marginBottom: ms(24) },
  field: { height: ms(52), borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: ms(14), gap: ms(10) },
  prefix: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
  vline: { width: 1, height: ms(24) },
  input: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, paddingVertical: 0 },
  cta: { marginTop: ms(20), minHeight: ms(50), borderRadius: 10, alignItems: "center", justifyContent: "center" },
  ctaText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
});
