import { Platform, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Header } from "@/components/ui/Header";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import type { Driver } from "@/types/models";

// Moved out of app/chat.tsx. Built from the shared Header (avatar as a leading
// visual, the call button as `right`) so it matches the Help & Support and
// support-chat headers instead of carrying its own 38pt/surface-bar chip.

interface Props {
  STATUS_LABEL: any;
  Linking: any;
  accent: ServiceTokens;
  driver: Driver;
  insets: EdgeInsets;
  partnerLabel: string;
  status: string;
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
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title={driver?.name || "Your partner"}
      subtitle={`${partnerLabel}${status && STATUS_LABEL[status] ? ` · ${STATUS_LABEL[status]}` : ""}`}
      onBack={() => router.back()}
      backHitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={t("app.support.back")}
      style={{ paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }}
      avatar={
        <View style={{
          width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20),
          backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border,
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="person" size={20} color={tokens.sec} />
        </View>
      }
      right={
        <TouchableOpacity
          style={{
            width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19),
            backgroundColor: accent.accent, alignItems: "center", justifyContent: "center",
          }}
          onPress={() => Linking.openURL(`tel:${driver?.phone || ""}`)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t("app.support.call")}
        >
          <Ionicons name="call" size={17} color={accent.on} />
        </TouchableOpacity>
      }
    />
  );
}
