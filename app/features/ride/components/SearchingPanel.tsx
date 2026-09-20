import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

// Moved out of app/ride-searching.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  colors: any;
  dotStyle: any;
  fare: any;
  progressBarStyle: any;
  showTripDetails: any;
  styles: any;
}

export function SearchingPanel({
  colors,
  dotStyle,
  fare,
  progressBarStyle,
  showTripDetails,
  styles,
}: Props) {
  return (
    <View style={styles.panel} pointerEvents="box-none">
      <View style={[styles.floatingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.handle} />

        <View style={styles.headerInfo}>
          <View style={styles.statusDotRow}>
            <Animated.View style={[styles.pulseDot, dotStyle, { backgroundColor: colors.success }]} />
            <Text style={styles.title}>Finding your captain...</Text>
          </View>
          <Text style={styles.subtitle}>Connecting with nearby drivers in your area</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBarActive, progressBarStyle]} />
        </View>

        <View style={[styles.fareCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
          <View style={[styles.bikeBadge, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="motorbike" size={24} color={colors.text} />
          </View>
          <View style={styles.fareTextGroup}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>₹{fare}</Text>
          </View>
          <TouchableOpacity style={[styles.tripButton, { borderColor: colors.border }]} onPress={showTripDetails}>
            <Text style={[styles.tripButtonText, { color: colors.text }]}>Trip Details</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.suggestionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight }]}>
          <View style={styles.suggestionHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <Ionicons name="person" size={20} color={colors.text} />
            </View>
            <Text style={[styles.suggestionTitle, { color: colors.text }]}>
              Captains aren&apos;t accepting at ₹{fare}. Try adding more:
            </Text>
          </View>

          <View style={styles.addFareRow}>
            {["+ ₹10", "+ ₹15", "+ ₹20", "+"].map((label) => (
              <TouchableOpacity key={label} style={[styles.addFarePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.addFareText, { color: colors.text }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
