import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  confirmedDriver: any;
  dateTimeStr: any;
  styles: FindingDriverStyles;
}

export function FindingDriverBody({
  confirmedDriver,
  dateTimeStr,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <View style={styles.confirmedIcon}>
      <Ionicons name="checkmark" size={moderateScale(32)} color="#fff" />
    </View>
    <Text style={styles.confirmedTitle}>{t("app.ride.bookingConfirmed")}</Text>
    <Text style={styles.confirmedSub}>
      {t("app.ride.aCaptainHasAcceptedYourReserved")} {dateTimeStr || t("app.ride.theScheduledTime")}{t("app.ride.weaposllNotifyYou15MinutesBefore")}
    </Text>
    <View style={styles.confirmedCard}>
      <Text style={styles.confirmedCardTitle}>{t("app.ride.captain")}</Text>
      <Text style={styles.confirmedCardRow}>{confirmedDriver.name}</Text>
      <Text style={styles.confirmedCardRowMuted}>{confirmedDriver.vehicle}{confirmedDriver.phone ? ` · ${confirmedDriver.phone}` : ""}</Text>
    </View>
    <TouchableOpacity style={styles.confirmedDoneBtn} onPress={() => router.replace("/(tabs)/orders")}>
      <Text style={styles.confirmedDoneBtnText}>{t("app.ride.done")}</Text>
    </TouchableOpacity>
    </>
  );
}
