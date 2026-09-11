import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: any;
  tokens: any;
}

export function SupportContactRow({
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={() => router.push("/support-chat")}>
      <View style={[styles.contactIcon, { backgroundColor: tokens.brandSkin }]}>
        <Ionicons name="chatbubble-ellipses" size={17} color={tokens.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.contactLabel}>Live chat</Text>
        <Text style={styles.contactDesc}>Message our support team</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
    </TouchableOpacity>
  );
}
