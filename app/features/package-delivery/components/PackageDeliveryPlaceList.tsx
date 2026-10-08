import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ServiceTokens, ThemeTokens } from "@/constants/colors";
import type { SavedAddress } from "@/services/users.service";
import type { PackageDeliverySearchStyles } from "../packageDeliverySearch.styles";
import type { PlaceResult } from "../usePackageDeliverySearch";

// The choices under the search field: the current location and saved addresses while the
// field is empty, search results once the customer types.

interface Props {
  query: string;
  results: PlaceResult[];
  searching: boolean;
  searchError: string;
  saved: SavedAddress[];
  busyId: string | null;
  styles: PackageDeliverySearchStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  onCurrentLocation: () => void;
  onSaved: (address: SavedAddress) => void;
  onResult: (result: PlaceResult) => void;
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub?: string;
  busy: boolean;
  highlight?: boolean;
  styles: PackageDeliverySearchStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  onPress: () => void;
}

function PlaceRow({ icon, title, sub, busy, highlight, styles, tokens, accent, onPress }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
      <View style={[styles.rowIcon, highlight && styles.rowIconAccent]}>
        {busy ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name={icon} size={moderateScale(18)} color={highlight ? accent.accent : tokens.sec} />}
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, highlight && styles.rowTitleAccent]} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={styles.rowSub} numberOfLines={2}>{sub}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const SAVED_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home", work: "briefcase", gym: "barbell", college: "school", hostel: "bed",
};

export function PackageDeliveryPlaceList(props: Props) {
  const { query, results, searching, searchError, saved, busyId, styles, tokens, accent, onCurrentLocation, onSaved, onResult } = props;
  const { t } = useTranslation();
  const rowTheme = { styles, tokens, accent };
  const typing = query.trim().length >= 2;

  return (
    <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {!typing && (
        <>
          <PlaceRow {...rowTheme} icon="locate" title={t("app.packageDelivery.useCurrentLocation")} busy={busyId === "current"} highlight onPress={onCurrentLocation} />
          {saved.length > 0 && <Text style={styles.sectionLabel}>{t("app.packageDelivery.savedAddresses")}</Text>}
          {saved.map((address, index) => {
            const id = String(address._id || address.id || address.addressLine);
            return (
              <React.Fragment key={id}>
                {index > 0 && <View style={styles.divider} />}
                <PlaceRow
                  {...rowTheme}
                  icon={SAVED_ICONS[String(address.label || "").toLowerCase()] || "bookmark"}
                  title={address.label || t("app.packageDelivery.saved")}
                  sub={address.addressLine || address.address}
                  busy={busyId === id}
                  onPress={() => onSaved(address)}
                />
              </React.Fragment>
            );
          })}
        </>
      )}

      {typing && results.map((result, index) => (
        <React.Fragment key={result.id || `${result.address}-${index}`}>
          {index > 0 && <View style={styles.divider} />}
          <PlaceRow
            {...rowTheme}
            icon="location-outline"
            title={result.main_text || result.name || result.address}
            sub={result.secondary_text || result.address}
            busy={busyId === result.id}
            onPress={() => onResult(result)}
          />
        </React.Fragment>
      ))}

      {typing && !searching && !results.length && (
        <Text style={styles.message}>{searchError || t("app.packageDelivery.noResults")}</Text>
      )}
    </ScrollView>
  );
}
