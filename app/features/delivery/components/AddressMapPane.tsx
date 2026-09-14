import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  cityOrCountry: any;
  isResolvingAddress: any;
  latLabel: any;
  lngLabel: any;
  shortAddress: any;
  styles: any;
}

export function AddressMapPane({
  cityOrCountry,
  isResolvingAddress,
  latLabel,
  lngLabel,
  shortAddress,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.addressMain} numberOfLines={1}>{isResolvingAddress ? t("app.delivery.fetchingLocation") : shortAddress}</Text>
      <Text style={styles.addressSub} numberOfLines={1}>{isResolvingAddress ? t("app.delivery.updatingAddressForPin") : cityOrCountry}</Text>
      <Text style={styles.addressCoords} numberOfLines={1}>{t("app.delivery.lat")} {latLabel}  {t("app.delivery.lng")} {lngLabel}</Text>
    </View>
  );
}
