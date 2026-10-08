import { ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  Linking: any;
  activeDriver: any;
  currentTaskPrice: number | null;
  dropoffLocation: any;
  handleCancel: () => void;
  insets: EdgeInsets;
  offer: any;
  pickupLocation: any;
  startOtp: any;
  styles: HelperTaskStyles;
  tokens: ThemeTokens;
}

export function TaskAssignedPanel({
  Linking,
  activeDriver,
  currentTaskPrice,
  dropoffLocation,
  handleCancel,
  insets,
  offer,
  pickupLocation,
  startOtp,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
        {startOtp && (
          <Animated.View style={styles.otpCard} entering={fadeInUp(0)}>
            <Text style={styles.otpLabel}>{t("app.delivery.shareThisOtpToStart")}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {String(startOtp).split("").map((digit, i) => (
                <View key={i} style={styles.otpDigit}><Text style={styles.otpDigitText}>{digit}</Text></View>
              ))}
            </View>
            <Text style={styles.otpHint}>{t("app.delivery.donapostShareThisCodeBeforeThe")}</Text>
          </Animated.View>
        )}

        <Animated.View style={styles.driverRow} entering={fadeInUp(60)}>
          <View style={styles.driverAvatar}><Ionicons name="person" size={22} color={tokens.sec} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.driverName}>{activeDriver.name || t("app.delivery.helper")}</Text>
            <Text style={styles.driverMeta}>{activeDriver.vehicle || activeDriver.vehicleType || t("app.delivery.onTheWay")}</Text>
          </View>
          {(currentTaskPrice ?? offer) != null && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.driverPrice}>₹{currentTaskPrice ?? offer}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={{ flexDirection: "row", gap: 10, marginVertical: 14 }} entering={fadeInUp(120)}>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${activeDriver.phone || ""}`)}>
            <Text style={styles.callBtnText}>{t("app.delivery.call")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageBtn} onPress={() => router.push("/chat")}>
            <Text style={styles.messageBtnText}>{t("app.delivery.message")}</Text>
          </TouchableOpacity>
        </Animated.View>

        {(pickupLocation || dropoffLocation) && (
          <Animated.View style={styles.routeCard} entering={fadeInUp(180)}>
            <View style={styles.railColSmall}>
              <View style={styles.pickupDotSmall} />
              <View style={styles.railLine} />
              <View style={styles.dropSquareSmall} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
              <Text style={styles.routeAddr} numberOfLines={1}>{pickupLocation}</Text>
              <Text style={styles.routeAddr} numberOfLines={1}>{dropoffLocation || "—"}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>{t("app.delivery.cancelTask")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
