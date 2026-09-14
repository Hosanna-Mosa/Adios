import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/personal-details.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
  user: any;
}

export function PersonalDetailsPhoneField({
  styles,
  user,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.phoneField}>
      <Text style={styles.phoneText}>{user?.phone || "—"}</Text>
      <View style={styles.verifiedPill}>
        <Text style={styles.verifiedPillText}>{t("app.auth.verified")}</Text>
      </View>
    </View>
  );
}
