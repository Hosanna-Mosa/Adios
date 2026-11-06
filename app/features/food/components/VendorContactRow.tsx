import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Feather } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";
import { type VendorDetails } from "../vendor-details.types";

// Side-by-side phone and email cards. Either may be missing, in which case the
// other stretches — the row keeps the original inline flexDirection/gap.

interface Props {
  vendor: VendorDetails | null;
  onCall: (phoneNumber: string) => void;
  onEmail: (emailAddress: string) => void;
  tokens: ThemeTokens;
  styles: RestaurantDetailsStyles;
}

export function VendorContactRow({ vendor, onCall, onEmail, tokens, styles }: Props) {
  if (!vendor?.phone && !vendor?.email) return null;

  return (
    <View style={[styles.section, { flexDirection: "row", gap: 10 }]}>
      {vendor?.phone && (
        <TouchableOpacity style={styles.contactCard} activeOpacity={0.85} onPress={() => onCall(vendor.phone)}>
          <Feather name="phone" size={15} color={tokens.sec} />
          <View style={{ minWidth: 0 }}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue} numberOfLines={1}>{vendor.phone}</Text>
          </View>
        </TouchableOpacity>
      )}
      {vendor?.email && (
        <TouchableOpacity style={styles.contactCard} activeOpacity={0.85} onPress={() => onEmail(vendor.email!)}>
          <Feather name="mail" size={15} color={tokens.sec} />
          <View style={{ minWidth: 0 }}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue} numberOfLines={1}>{vendor.email}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
