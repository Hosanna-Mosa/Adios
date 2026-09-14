import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  Linking: any;
  styles: any;
  tokens: any;
}

export function SupportContactRow2({
  Linking,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL("tel:18002024477")}>
      <View style={[styles.contactIcon, { backgroundColor: tokens.sunken }]}>
        <Ionicons name="call" size={16} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.contactLabel}>{t("app.support.callHelpline")}</Text>
        <Text style={styles.contactDesc}>1800 202 4477 · 7 AM – 1 AM</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
    </TouchableOpacity>
  );
}
