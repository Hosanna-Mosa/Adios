import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  STATUS_LABEL: any;
  insets: any;
  setViewMode: any;
  styles: any;
  ticket: any;
  tokens: any;
}

export function SupportChatHeader({
  STATUS_LABEL,
  insets,
  setViewMode,
  styles,
  ticket,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setViewMode("cases")}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerName}>{t("app.support.flavourSupport")}</Text>
        <Text style={styles.headerStatus}>{t("app.support.case")}{ticket.ticketId} · {STATUS_LABEL[ticket.status]}</Text>
      </View>
    </View>
  );
}
