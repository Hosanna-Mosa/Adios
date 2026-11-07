import { ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DeleteAccountStyles } from "../deleteAccount.styles";

interface Props {
  confirmDelete: () => void;
  deleting: boolean;
  insets: EdgeInsets;
  password: string;
  setPassword: (value: string) => void;
  styles: DeleteAccountStyles;
  tokens: ThemeTokens;
}

const POINTS = ["pointProfile", "pointAddresses", "pointSignOut", "pointOrders"] as const;

export function DeleteAccountBody({ confirmDelete, deleting, insets, password, setPassword, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{t("app.deleteAccount.heading")}</Text>
        {POINTS.map((key) => (
          <View key={key} style={styles.pointRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.pointText}>{t(`app.deleteAccount.${key}`)}</Text>
          </View>
        ))}

        <Text style={styles.label}>{t("app.deleteAccount.passwordLabel")}</Text>
        <TextInput
          style={styles.field}
          value={password}
          onChangeText={setPassword}
          placeholder={t("app.deleteAccount.passwordPlaceholder")}
          placeholderTextColor={tokens.muted}
          secureTextEntry
          autoCapitalize="none"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Button
          title={t("app.deleteAccount.deleteMyAccount")}
          variant="danger"
          onPress={confirmDelete}
          disabled={!password}
          loading={deleting}
          fullWidth
        />
      </View>
    </>
  );
}
