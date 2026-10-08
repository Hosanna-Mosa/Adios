import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { modalSlideUp } from "@/motion/presets";
import type { usePackageDeliveryConfirm } from "../usePackageDeliveryConfirm";
import { PackageDeliveryVehicleOptions } from "./PackageDeliveryVehicleOptions";
import { PackageDeliveryPayBar } from "./PackageDeliveryPayBar";

// The bottom sheet of the confirm step: vehicles, then payment and Book.

interface Props {
  confirm: ReturnType<typeof usePackageDeliveryConfirm>;
}

export function PackageDeliveryConfirmSheet({ confirm: c }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View
      style={c.styles.sheet}
      entering={modalSlideUp}
      onLayout={(e) => c.setSheetHeight(Math.round(e.nativeEvent.layout.height))}
    >
      <View style={c.styles.handle} />
      <ScrollView contentContainerStyle={c.styles.body} showsVerticalScrollIndicator={false} bounces={false}>
        <Text style={c.styles.sheetTitle}>{t("app.packageDelivery.sheetTitle")}</Text>
        <PackageDeliveryVehicleOptions
          vehicle={c.vehicle}
          fares={c.fares}
          loadingFares={c.loadingFares}
          pickupEta={c.pickupEta}
          styles={c.styles}
          accent={c.accent}
          onSelect={c.setVehicle}
        />
        {c.tooShort && (
          <View style={c.styles.notice}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={c.tokens.error} />
            <Text style={c.styles.noticeText}>{t("app.packageDelivery.samePlace")}</Text>
          </View>
        )}
      </ScrollView>
      <View style={c.styles.footer}>
        <PackageDeliveryPayBar
          paymentMethod={c.paymentMethod}
          payAt={c.payAt}
          fare={c.fare}
          canBook={c.canBook}
          booking={c.booking}
          styles={c.styles}
          accent={c.accent}
          onPayAt={c.setPayAt}
          onBook={c.book}
        />
      </View>
    </Animated.View>
  );
}
