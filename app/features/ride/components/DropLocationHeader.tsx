import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/drop-location.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  bookingFor: any;
  insets: any;
  name: any;
  setShowBookingForSheet: any;
  styles: any;
  tokens: any;
}

export function DropLocationHeader({
  bookingFor,
  insets,
  name,
  setShowBookingForSheet,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t("app.ride.whereTo")}</Text>
      <TouchableOpacity style={styles.forMeSelector} onPress={() => setShowBookingForSheet(true)}>
        <Text style={styles.forMeText}>{bookingFor === "myself" ? t("app.ride.forMe") : t("app.ride.someoneElse")}</Text>
        <Ionicons name="chevron-down" size={14} color={tokens.sec} />
      </TouchableOpacity>
    </View>
  );
}
