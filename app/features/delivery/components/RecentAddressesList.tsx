import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type SavedAddressesStyles } from "@/features/delivery/saved-addresses.styles";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleSelectRecentLocation: any;
  recentLoading: any;
  recentLocations: any[];
  selectingId: any;
  styles: SavedAddressesStyles;
  tokens: ThemeTokens;
}

export function RecentAddressesList({
  accent,
  handleSelectRecentLocation,
  recentLoading,
  recentLocations,
  selectingId,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.delivery.recent")}</Text>
      {recentLoading && recentLocations.length === 0 ? (
        <ActivityIndicator color={accent.accent} style={{ paddingVertical: 16 }} />
      ) : (
        recentLocations.map((item, idx) => (
          <Animated.View key={item.id || idx} entering={staggerListItem(idx)}>
          <TouchableOpacity
            style={[styles.recentRow, idx < recentLocations.length - 1 && styles.recentRowDivider]}
            onPress={() => handleSelectRecentLocation(item)}
            disabled={selectingId !== null}
            accessibilityRole="button"
          >
            <View style={styles.recentIcon}><Ionicons name="time-outline" size={16} color={tokens.sec} /></View>
            <Text style={styles.recentName} numberOfLines={1}>{item.name}{item.address ? `, ${item.address}` : ""}</Text>
            {/* A chevron: the whole row picks the location. A bold "Save" here looked like
                its own button, yet tapping it just selected the location too. */}
            <Ionicons name="chevron-forward" size={16} color={tokens.muted} />
          </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </View>
  );
}
