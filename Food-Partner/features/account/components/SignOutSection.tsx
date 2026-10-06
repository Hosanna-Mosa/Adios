import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import type { AccountStyles } from "../account.styles";

/** Sign out, and the app version underneath. */
export function SignOutSection({ onSignOut, version, styles }: { onSignOut: () => void; version: string; styles: AccountStyles }) {
  const { t } = useTranslation();
  return (
    <>
      <ListGroup grouped={false} delay={220}>
        <ListRow icon="log-out-outline" label={t("account.signOut")} destructive card onPress={onSignOut} right={null} />
      </ListGroup>
      <Text style={styles.version}>{t("account.version", { version })}</Text>
    </>
  );
}
