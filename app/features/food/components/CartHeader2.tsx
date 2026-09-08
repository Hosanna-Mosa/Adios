import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  styles: any;
  tokens: any;
}

export function CartHeader2({
  insets,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitleSolo}>Cart</Text>
    </View>
  );
}
