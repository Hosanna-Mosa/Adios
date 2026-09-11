import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/ride-confirmation.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  confirmedReservation: any;
  getDisplayName: any;
  insets: any;
  styles: any;
}

export function RideConfirmBody({
  confirmedReservation,
  getDisplayName,
  insets,
  styles,
}: Props) {
  return (
    <>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
      <Animated.View style={styles.successBlock} entering={fadeInUp(0)}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={moderateScale(32)} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Reservation{"\n"}confirmed</Text>
        <Text style={styles.successSub}>We&apos;ll assign your captain at {confirmedReservation.timeStr} and notify you.</Text>
      </Animated.View>

      <Animated.View style={styles.section} entering={fadeInUp(100)}>
        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Service</Text><Text style={styles.detailsValue}>{confirmedReservation.tierName}</Text></View>
          <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Pickup time</Text><Text style={styles.detailsValue}>{confirmedReservation.dateTimeStr}</Text></View>
          <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Pickup</Text><Text style={styles.detailsValue} numberOfLines={1}>{getDisplayName(confirmedReservation.pickupName)}</Text></View>
          <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Drop</Text><Text style={styles.detailsValue} numberOfLines={1}>{getDisplayName(confirmedReservation.dropName)}</Text></View>
          <View style={[styles.detailsRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailsLabel}>Estimated price</Text>
            <Text style={styles.detailsPrice}>{confirmedReservation.fare != null ? `₹${Math.round(confirmedReservation.fare)}` : "—"}</Text>
          </View>
        </View>
        <Text style={styles.estimateNote}>Estimated · final fare may change with route and waiting time.</Text>
      </Animated.View>
    </ScrollView>
    </>
  );
}
