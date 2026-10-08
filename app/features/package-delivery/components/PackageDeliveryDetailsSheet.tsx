import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { modalSlideUp } from "@/motion/presets";
import type { usePackageDeliveryDetails } from "../usePackageDeliveryDetails";
import { PackageDeliveryContactForm } from "./PackageDeliveryContactForm";
import { PackageDeliveryFavouriteChips } from "./PackageDeliveryFavouriteChips";

// The sheet under the map on the details step: address, contact, favourites, confirm.

interface Props {
  details: ReturnType<typeof usePackageDeliveryDetails>;
}

export function PackageDeliveryDetailsSheet({ details: d }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={d.styles.sheet} entering={modalSlideUp}>
      <View style={d.styles.handle} />
      <ScrollView contentContainerStyle={d.styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PackageDeliveryContactForm
          kind={d.kind}
          address={d.place.address}
          houseNo={d.houseNo}
          name={d.name}
          phone={d.phone}
          useMine={d.useMine}
          hasMyContact={d.hasMyContact}
          nameError={d.nameError}
          phoneError={d.phoneError}
          styles={d.styles}
          tokens={d.tokens}
          onHouseNo={d.setHouseNo}
          onName={d.changeName}
          onPhone={d.changePhone}
          onToggleMine={d.toggleUseMine}
          onChangeAddress={d.goBack}
        />
        <PackageDeliveryFavouriteChips
          selected={d.favourite}
          customLabel={d.customLabel}
          styles={d.styles}
          tokens={d.tokens}
          onSelect={d.setFavourite}
          onCustomLabel={d.setCustomLabel}
        />
      </ScrollView>
      <View style={d.styles.footer}>
        <TouchableOpacity
          style={[d.styles.confirmBtn, !d.canConfirm && d.styles.confirmBtnOff]}
          onPress={d.confirm}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityState={{ disabled: !d.canConfirm }}
        >
          <Text style={d.styles.confirmText}>{d.kind === "pickup" ? t("app.packageDelivery.confirmPickup") : t("app.packageDelivery.confirmDrop")}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
