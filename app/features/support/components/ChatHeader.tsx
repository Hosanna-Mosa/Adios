import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ChatStyles } from "@/features/support/useChat.shared";
import type { Driver } from "@/types/models";
import { WEB_TOP_OFFSET } from "@/constants/layout";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  STATUS_LABEL: any;
  Linking: any;
  accent: ServiceTokens;
  driver: Driver;
  insets: EdgeInsets;
  partnerLabel: string;
  status: string;
  styles: ChatStyles;
  tokens: ThemeTokens;
}

export function ChatHeader({
  STATUS_LABEL,
  Linking,
  accent,
  driver,
  insets,
  partnerLabel,
  status,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.header, { paddingTop: insets.top + WEB_TOP_OFFSET + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={styles.headerAvatar}>
        <Ionicons name="person" size={20} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerName} numberOfLines={1}>{driver?.name || partnerLabel}</Text>
        <Text style={[styles.headerStatus, { color: accent.accent }]} numberOfLines={1}>
          {partnerLabel}{status && STATUS_LABEL[status] ? ` · ${STATUS_LABEL[status]}` : ""}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.callBtn, { backgroundColor: accent.accent }]}
        onPress={() => Linking.openURL(`tel:${driver?.phone || ""}`)}
        accessibilityRole="button"
        accessibilityLabel={t("app.a11y.callName", { name: driver?.name || partnerLabel })}
      >
        <Ionicons name="call" size={17} color={accent.on} />
      </TouchableOpacity>
    </View>
  );
}
