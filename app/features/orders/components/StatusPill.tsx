import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type OrdersStyles } from "../orders.styles";

/** Outlined status pill: blue "Preparing" (live), green "✓ Delivered", red "Cancelled". */
export function StatusPill({ label, color, background, icon, styles }: { label: string; color: string; background: string; icon: "ring" | "check" | "close"; styles: OrdersStyles }) {
  return (
    <View style={[styles.pill, { borderColor: color, backgroundColor: background }]}>
      {icon === "ring" ? (
        <View style={{ width: moderateScale(9), height: moderateScale(9), borderRadius: moderateScale(5), borderWidth: 2, borderColor: color }} />
      ) : (
        <Ionicons name={icon === "check" ? "checkmark" : "close"} size={moderateScale(11)} color={color} />
      )}
      <Text style={[styles.pillText, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}
