import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import type { AccountStyles } from "../account.styles";

const POINTS = ["removed", "menu", "records", "signedOut", "final"] as const;

interface Props {
  password: string;
  setPassword: (v: string) => void;
  error?: string;
  loading: boolean;
  submit: () => void;
  styles: AccountStyles;
  tokens: ThemeTokens;
}

/** What deleting means, the current password, and Delete. */
export function DeleteAccountForm(p: Props) {
  const { t } = useTranslation();
  const lock = <Ionicons name="lock-closed-outline" size={18} color={p.tokens.muted} />;

  return (
    <Card bordered elevationLevel="none" style={p.styles.form}>
      <Text style={p.styles.heading}>{t("deleteAccount.whatHappens")}</Text>
      <View style={p.styles.points}>
        {POINTS.map((point) => (
          <View key={point} style={p.styles.point}>
            <Text style={p.styles.pointText}>•</Text>
            <Text style={p.styles.pointText}>{t(`deleteAccount.points.${point}`)}</Text>
          </View>
        ))}
      </View>
      <PasswordField
        label={t("password.currentLabel")}
        placeholder={t("password.currentPlaceholder")}
        value={p.password}
        onChangeText={p.setPassword}
        error={p.error}
        textContentType="password"
        onSubmitEditing={p.submit}
        showLabel={t("auth.showPassword")}
        hideLabel={t("auth.hidePassword")}
        icon={lock}
      />
      <Button title={t("deleteAccount.delete")} variant="danger" onPress={p.submit} loading={p.loading} fullWidth />
    </Card>
  );
}
