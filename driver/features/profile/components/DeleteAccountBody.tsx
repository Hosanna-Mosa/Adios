import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const POINTS = ["removed", "kyc", "records", "signedOut", "final"] as const;

interface Props {
  password: string;
  onChangePassword: (value: string) => void;
  error: string | null;
  deleting: boolean;
  onDelete: () => void;
}

/** What deleting means, the password confirmation, and the delete button (app/delete-account.tsx). */
export function DeleteAccountBody({ password, onChangePassword, error, deleting, onDelete }: Props) {
  const { t } = useTranslation();
  return (
    <Box style={styles.wrap}>
      <AppText style={styles.heading}>{t("profile.deleteAccount.whatHappens")}</AppText>
      {POINTS.map((point) => (
        <Box key={point} style={styles.point}>
          <AppText style={styles.bullet}>•</AppText>
          <AppText style={styles.body}>{t(`profile.deleteAccount.points.${point}`)}</AppText>
        </Box>
      ))}

      <Box style={styles.field}>
        <TextField
          label={t("profile.deleteAccount.passwordLabel")}
          value={password}
          onChangeText={onChangePassword}
          placeholder={t("profile.deleteAccount.passwordPlaceholder")}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          error={error ?? undefined}
        />
      </Box>

      <Button title={t("profile.deleteAccount.deleteButton")} variant="danger" onPress={onDelete} loading={deleting} fullWidth />
    </Box>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  heading: { fontSize: typography.sizes.large, fontWeight: "700", color: Colors.text, marginBottom: 10 },
  point: { flexDirection: "row", gap: 8, marginBottom: 8 },
  bullet: { fontSize: typography.sizes.medium, fontWeight: "700", color: Colors.textSecondary },
  body: { flex: 1, fontSize: typography.sizes.medium, color: Colors.textSecondary },
  field: { marginTop: 16, marginBottom: 20 },
});
