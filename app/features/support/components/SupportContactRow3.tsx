import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/support.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  Linking: any;
  styles: any;
  tokens: any;
}

export function SupportContactRow3({
  Linking,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL("mailto:care@flavour.in")}>
      <View style={[styles.contactIcon, { backgroundColor: tokens.sunken }]}>
        <Ionicons name="mail" size={16} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.contactLabel}>Email us</Text>
        <Text style={styles.contactDesc}>care@flavour.in · within 24 hours</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
    </TouchableOpacity>
  );
}
