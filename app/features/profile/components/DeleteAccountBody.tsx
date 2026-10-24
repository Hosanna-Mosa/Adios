import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type EdgeInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

interface Props {
  tokens: ThemeTokens;
  insets: EdgeInsets;
  password: string;
  onChangePassword: (value: string) => void;
  error: string | null;
  deleting: boolean;
  onDelete: () => void;
}

/** What deleting means, the password confirmation, and the delete button (app/delete-account.tsx). */
export function DeleteAccountBody({ tokens, insets, password, onChangePassword, error, deleting, onDelete }: Props) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  return (
    <>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 140 }}>
        <Text style={styles.heading}>{t("app.deleteAccount.whatHappens")}</Text>
        {(["removed", "orders", "signedOut", "final"] as const).map((point) => (
          <View key={point} style={styles.point}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.body}>{t(`app.deleteAccount.points.${point}`)}</Text>
          </View>
        ))}

        <Text style={[styles.label, { marginTop: 20 }]}>{t("app.deleteAccount.passwordLabel")}</Text>
        <TextInput
          style={[styles.field, !!error && styles.fieldInvalid]}
          value={password}
          onChangeText={onChangePassword}
          placeholder={t("app.deleteAccount.passwordPlaceholder")}
          placeholderTextColor={tokens.muted}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
        />
        {!!error && <Text style={styles.fieldError}>{error}</Text>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Button title={t("app.deleteAccount.deleteButton")} variant="danger" onPress={onDelete} loading={deleting} fullWidth />
      </View>
    </>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    heading: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.large, color: tokens.text, marginBottom: 10 },
    point: { flexDirection: "row", gap: 8, marginBottom: 8 },
    bullet: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.sec },
    body: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec },
    label: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 6 },
    field: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, backgroundColor: tokens.surface },
    fieldInvalid: { borderColor: tokens.error, borderWidth: 2 },
    fieldError: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error, marginTop: 6 },
    footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border, paddingHorizontal: 16, paddingTop: 14 },
  });
