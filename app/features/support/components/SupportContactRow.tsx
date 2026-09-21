import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// One "contact us" row. Replaces SupportContactRow{,2,3}, which were the same
// row with a different icon, tint, label and action.
//
// The icon sizes differ by a point between the chat row (17) and the phone/mail
// rows (16); that is carried as a prop rather than normalised, so the rendering
// is unchanged.

interface Props {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconSize: number;
  iconBackground: string;
  iconColor: string;
  label: string;
  description: string;
  onPress: () => void;
  styles: {
    contactRow: object;
    contactIcon: object;
    contactLabel: object;
    contactDesc: object;
  };
  tokens: { muted: string };
}

export function SupportContactRow({
  icon,
  iconSize,
  iconBackground,
  iconColor,
  label,
  description,
  onPress,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={iconSize} color={iconColor} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
    </TouchableOpacity>
  );
}
