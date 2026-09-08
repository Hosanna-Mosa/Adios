import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  confirmedDriver: any;
  dateTimeStr: any;
  styles: any;
}

export function FindingDriverBody({
  confirmedDriver,
  dateTimeStr,
  styles,
}: Props) {
  return (
    <>
    <View style={styles.confirmedIcon}>
      <Ionicons name="checkmark" size={moderateScale(32)} color="#fff" />
    </View>
    <Text style={styles.confirmedTitle}>Booking confirmed</Text>
    <Text style={styles.confirmedSub}>
      A captain has accepted your reserved ride for {dateTimeStr || "the scheduled time"}. We&apos;ll notify you 15 minutes before pickup.
    </Text>
    <View style={styles.confirmedCard}>
      <Text style={styles.confirmedCardTitle}>Captain</Text>
      <Text style={styles.confirmedCardRow}>{confirmedDriver.name}</Text>
      <Text style={styles.confirmedCardRowMuted}>{confirmedDriver.vehicle}{confirmedDriver.phone ? ` · ${confirmedDriver.phone}` : ""}</Text>
    </View>
    <TouchableOpacity style={styles.confirmedDoneBtn} onPress={() => router.replace("/(tabs)/orders")}>
      <Text style={styles.confirmedDoneBtnText}>Done</Text>
    </TouchableOpacity>
    </>
  );
}
