import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  styles: any;
  tokens: any;
}

export function SupportChatHeader2({
  insets,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerName}>Your cases</Text>
    </View>
  );
}
