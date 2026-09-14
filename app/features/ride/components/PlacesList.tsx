import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";

// Moved out of app/drop-location.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  drop: any;
  dropRef: any;
  handleSelection: any;
  isSearching: any;
  pickup: any;
  pickupRef: any;
  recentPlaces: any[];
  savedAddresses: any[];
  searchError: any;
  searchLoading: any;
  searchResults: any[];
  searchText: any;
  selectResult: any;
  selectSavedAddress: any;
  styles: any;
  tokens: any;
}

export function PlacesList({
  drop,
  dropRef,
  handleSelection,
  isSearching,
  pickup,
  pickupRef,
  recentPlaces,
  savedAddresses,
  searchError,
  searchLoading,
  searchResults,
  searchText,
  selectResult,
  selectSavedAddress,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.placesScroll} keyboardShouldPersistTaps="handled">
      {!isSearching && savedAddresses.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>{t("app.ride.savedPlaces")}</Text>
          <View style={styles.savedCard}>
            {savedAddresses.map((addr, idx) => (
              <Animated.View key={addr._id} entering={staggerListItem(idx)}>
                <TouchableOpacity
                  style={[styles.savedRow, idx < savedAddresses.length - 1 && styles.savedRowDivider]}
                  onPress={() => selectSavedAddress(addr)}
                >
                  <View style={styles.savedAvatar}>
                    <Text style={styles.savedAvatarText}>{(addr.label || "?")[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.savedLabel}>{addr.label || t("app.ride.addressFallback")}</Text>
                    <Text style={styles.savedAddress} numberOfLines={1}>{addr.addressLine}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {isSearching ? t("app.ride.searchResults") : t("app.ride.recent")}
      </Text>

      {isSearching && searchText.trim().length >= 2 && searchResults.length === 0 ? (
        <View style={styles.emptyRecents}>
          <Text style={styles.emptyRecentsText}>
            {searchLoading ? t("app.ride.searchingPlaces") : searchError || t("app.ride.noMatchingPlacesFound")}
          </Text>
        </View>
      ) : null}

      {!isSearching && recentPlaces.length === 0 ? (
        <View style={styles.emptyRecents}>
          <Text style={styles.emptyRecentsText}>{t("app.ride.yourSearchedPlacesWillAppearHere")}</Text>
        </View>
      ) : (isSearching ? searchResults : recentPlaces).map((place, idx) => (
        <Animated.View key={place.id} entering={staggerListItem(idx)}>
          <TouchableOpacity
            style={styles.placeItem}
            onPress={() => {
              if (isSearching) {
                selectResult(place);
              } else {
                if (!pickup) {
                  pickupRef.current?.setAddressText(place.address || place.name);
                  handleSelection('pickup', { id: place.id, name: place.name, description: place.address || place.name, lat: place.lat, lng: place.lng }, null);
                } else {
                  dropRef.current?.setAddressText(place.address || place.name);
                  handleSelection('drop', { id: place.id, name: place.name, description: place.address || place.name, lat: place.lat, lng: place.lng }, null);
                }
              }
            }}
          >
            <View style={styles.placeIconBox}>
              <Ionicons
                name={isSearching ? "search" : "time-outline"}
                size={17}
                color={tokens.sec}
              />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
