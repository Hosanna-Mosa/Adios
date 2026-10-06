import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import type { AccountStyles } from "../account.styles";

type Field = "current" | "next" | "confirm";

interface Props {
  current: string;
  setCurrent: (v: string) => void;
  next: string;
  setNext: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  errors: Partial<Record<Field, string>>;
  loading: boolean;
  submit: () => void;
  minLength: number;
  styles: AccountStyles;
  tokens: ThemeTokens;
}

/** Current password, new password twice, and Update. */
export function ChangePasswordForm(p: Props) {
  const { t } = useTranslation();
  const lock = <Ionicons name="lock-closed-outline" size={18} color={p.tokens.muted} />;
  const eye = { showLabel: t("auth.showPassword"), hideLabel: t("auth.hidePassword"), icon: lock };

  return (
    <Card bordered elevationLevel="none" style={p.styles.form}>
      <PasswordField label={t("password.currentLabel")} placeholder={t("password.currentPlaceholder")} value={p.current} onChangeText={p.setCurrent} error={p.errors.current} textContentType="password" {...eye} />
      <PasswordField label={t("password.newLabel")} placeholder={t("password.newPlaceholder")} value={p.next} onChangeText={p.setNext} error={p.errors.next} textContentType="newPassword" {...eye} />
      <PasswordField
        label={t("password.confirmLabel")}
        placeholder={t("password.confirmPlaceholder")}
        value={p.confirm}
        onChangeText={p.setConfirm}
        error={p.errors.confirm}
        textContentType="newPassword"
        onSubmitEditing={p.submit}
        {...eye}
      />
      <Text style={p.styles.rule}>{t("password.rule", { count: p.minLength })}</Text>
      <Button title={t("password.update")} onPress={p.submit} loading={p.loading} fullWidth />
    </Card>
  );
}
