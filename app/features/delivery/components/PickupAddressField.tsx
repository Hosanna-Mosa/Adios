import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type AddStopStyles } from "@/features/delivery/add-stop.styles";

// Moved out of app/delivery/add-stop.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  address: any;
  addressInput: any;
  autocompleteSuggestions: any[];
  handleAddressInput: any;
  handleSelectSuggestion: any;
  isSearching: boolean;
  setShowDropdown: any;
  setStoreName: any;
  showDropdown: boolean;
  storeName: string;
  styles: AddStopStyles;
  tokens: ThemeTokens;
}

export function PickupAddressField({
  accent,
  address,
  addressInput,
  autocompleteSuggestions,
  handleAddressInput,
  handleSelectSuggestion,
  isSearching,
  setShowDropdown,
  setStoreName,
  showDropdown,
  storeName,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.fieldLabel}>{t("app.delivery.storeNameOptional")}</Text>
      <View style={styles.fieldBox}>
        <TextInput style={styles.fieldInput} placeholder={t("app.delivery.egKarachiBakery")} placeholderTextColor={tokens.muted} value={storeName} onChangeText={setStoreName} />
      </View>

      <Text style={[styles.fieldLabel, { marginTop: 14 }]}>{t("app.delivery.pickupAddress")}</Text>
      <View style={[styles.fieldBox, styles.fieldBoxFocused, showDropdown && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
        <TextInput
          style={styles.fieldInput}
          placeholder={t("app.delivery.searchNearbyStoreOrAddress")}
          placeholderTextColor={tokens.muted}
          value={addressInput}
          onChangeText={handleAddressInput}
          onFocus={() => autocompleteSuggestions.length > 0 && setShowDropdown(true)}
          returnKeyType="search"
        />
        {isSearching && <ActivityIndicator size="small" color={accent.accent} />}
        {address && !isSearching && <Ionicons name="checkmark-circle" size={16} color={accent.accent} />}
      </View>
      {showDropdown && autocompleteSuggestions.length > 0 && (
        <View style={styles.dropdown}>
          {autocompleteSuggestions.map((item, idx) => (
            <TouchableOpacity key={item.id || idx} style={[styles.dropdownRow, idx < autocompleteSuggestions.length - 1 && styles.dropdownRowDivider]} onPress={() => handleSelectSuggestion(item)}>
              <Ionicons name="location-outline" size={14} color={tokens.sec} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.dropdownMain} numberOfLines={1}>{item.name || item.main_text}</Text>
                <Text style={styles.dropdownSub} numberOfLines={1}>{item.address || item.secondary_text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
