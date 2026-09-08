import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  STATUS_LABEL: any;
  Linking: any;
  accent: any;
  driver: any;
  insets: any;
  partnerLabel: any;
  status: any;
  styles: any;
  tokens: any;
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
  return (
    <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={styles.headerAvatar}>
        <Ionicons name="person" size={20} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerName} numberOfLines={1}>{driver?.name || "Your partner"}</Text>
        <Text style={[styles.headerStatus, { color: accent.accent }]} numberOfLines={1}>
          {partnerLabel}{status && STATUS_LABEL[status] ? ` · ${STATUS_LABEL[status]}` : ""}
        </Text>
      </View>
      <TouchableOpacity style={[styles.callBtn, { backgroundColor: accent.accent }]} onPress={() => Linking.openURL(`tel:${driver?.phone || ""}`)}>
        <Ionicons name="call" size={17} color={accent.on} />
      </TouchableOpacity>
    </View>
  );
}
