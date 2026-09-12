import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type ServiceTokens } from "@/constants/colors";
import { type AddStopStyles } from "@/features/delivery/add-stop.styles";

// Moved out of app/delivery/add-stop.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  getDistanceMeters: any;
  formatDistance: any;
  accent: ServiceTokens;
  currentCoords: any;
  handleSelectSuggestion: any;
  nearbySuggestions: any[];
  styles: AddStopStyles;
}

export function NearbySuggestionsList({
  getDistanceMeters,
  formatDistance,
  accent,
  currentCoords,
  handleSelectSuggestion,
  nearbySuggestions,
  styles,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Nearby suggestions</Text>
      <View style={{ gap: 8 }}>
        {nearbySuggestions.map((item, i) => (
          <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => handleSelectSuggestion(item)} activeOpacity={0.85}>
            <View style={styles.suggestionThumb} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
              {currentCoords && item.lat != null && item.lng != null && (
                <Text style={styles.suggestionMeta}>
                  {formatDistance(getDistanceMeters(currentCoords.lat, currentCoords.lng, item.lat, item.lng))} from your start point
                </Text>
              )}
            </View>
            <Ionicons name="add" size={18} color={accent.accent} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
