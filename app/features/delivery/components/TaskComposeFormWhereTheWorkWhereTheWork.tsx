import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HelperTaskStyles } from "../helper-task.styles";

// Section of TaskComposeFormWhereTheWork, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  activeField: any;
  dropoffLocation: any;
  handleSearch: any;
  handleUseCurrentLocation: () => void;
  pickupLocation: any;
  searchResults: any[];
  selectResult: any;
  setActiveField: React.Dispatch<React.SetStateAction<any>>;
  styles: HelperTaskStyles;
  tokens: ThemeTokens;
}

export function TaskComposeFormWhereTheWorkWhereTheWork({
  accent,
  activeField,
  dropoffLocation,
  handleSearch,
  handleUseCurrentLocation,
  pickupLocation,
  searchResults,
  selectResult,
  setActiveField,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(80)}>
      <View style={styles.locationCard}>
        <View style={styles.railCol}>
          <View style={styles.pickupDot} />
          <View style={styles.railLine} />
          <View style={styles.dropSquare} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
          <View>
            <Text style={styles.fieldLabel}>{t("app.delivery.whereTheWorkStarts")}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder=""
                placeholderTextColor={tokens.muted}
                value={pickupLocation}
                onChangeText={(t) => handleSearch(t, "pickup")}
                onFocus={() => setActiveField("pickup")}
              />
              <TouchableOpacity onPress={handleUseCurrentLocation}>
                <Ionicons name="locate" size={moderateScale(18)} color={accent.accent} />
              </TouchableOpacity>
            </View>
            {activeField === "pickup" && searchResults.length > 0 && (
              <View style={styles.dropdown}>
                {searchResults.map((r, i) => (
                  <TouchableOpacity key={r.id || i} style={styles.dropdownRow} onPress={() => selectResult(r)}>
                    <Ionicons name="location-outline" size={15} color={tokens.sec} />
                    <Text style={styles.dropdownText} numberOfLines={1}>{r.description || r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={{ height: 1, backgroundColor: tokens.border }} />
          <View>
            <Text style={styles.fieldLabel}>{t("app.delivery.whereItEnds")}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={t("app.delivery.dropoffOptional")}
                placeholderTextColor={tokens.muted}
                value={dropoffLocation}
                onChangeText={(t) => handleSearch(t, "dropoff")}
                onFocus={() => setActiveField("dropoff")}
              />
            </View>
            {activeField === "dropoff" && searchResults.length > 0 && (
              <View style={styles.dropdown}>
                {searchResults.map((r, i) => (
                  <TouchableOpacity key={r.id || i} style={styles.dropdownRow} onPress={() => selectResult(r)}>
                    <Ionicons name="location-outline" size={15} color={tokens.sec} />
                    <Text style={styles.dropdownText} numberOfLines={1}>{r.description || r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
