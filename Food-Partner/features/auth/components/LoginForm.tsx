import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordField, TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { AuthStyles } from "../auth.styles";

interface Props {
  identifier: string;
  setIdentifier: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  errors: { identifier?: string; password?: string };
  loading: boolean;
  submit: () => void;
  styles: AuthStyles;
  tokens: ThemeTokens;
}

/** Email-or-phone + password, "Forgot password?" and Sign in. */
export function LoginForm({ identifier, setIdentifier, password, setPassword, errors, loading, submit, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(80)}>
      <Card bordered elevationLevel="none" padding={18} style={styles.form}>
        <TextField
          label={t("auth.identifierLabel")}
          placeholder={t("auth.identifierPlaceholder")}
          value={identifier}
          onChangeText={setIdentifier}
          error={errors.identifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="next"
          icon={<Ionicons name="person-outline" size={18} color={tokens.muted} />}
        />
        <PasswordField
          label={t("auth.passwordLabel")}
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          showLabel={t("auth.showPassword")}
          hideLabel={t("auth.hidePassword")}
          icon={<Ionicons name="lock-closed-outline" size={18} color={tokens.muted} />}
        />
        <Button title={t("auth.forgotPassword")} variant="link" onPress={() => router.push("/forgot-password")} style={styles.forgotLink} />
        <Button title={t("auth.signIn")} onPress={submit} loading={loading} fullWidth />
      </Card>
    </Animated.View>
  );
}
