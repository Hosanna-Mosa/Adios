import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  Linking: any;
  accent: any;
  driver: any;
  isHelper: any;
  styles: any;
  tokens: any;
  unreadCount: any;
}

export function TrackingPartnerRow({
  Linking,
  accent,
  driver,
  isHelper,
  styles,
  tokens,
  unreadCount,
}: Props) {
  return (
    <View style={styles.partnerRow}>
      <View style={styles.partnerAvatar}>
        <Ionicons name="person" size={22} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.partnerName} numberOfLines={1}>{driver.name || "Assigned partner"}</Text>
        <Text style={styles.partnerMeta}>{driver.vehicle && driver.vehicle !== "unknown" ? driver.vehicle.charAt(0).toUpperCase() + driver.vehicle.slice(1) : isHelper ? "Helper" : "Delivery partner"}</Text>
      </View>
      <TouchableOpacity style={[styles.circleBtn, { backgroundColor: accent.accent }]} onPress={() => Linking.openURL(`tel:${driver.phone || ""}`)}>
        <Ionicons name="call" size={17} color={accent.on} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.circleBtnOutline} onPress={() => router.push("/chat")}>
        <Ionicons name="chatbubble-outline" size={17} color={tokens.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: tokens.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
