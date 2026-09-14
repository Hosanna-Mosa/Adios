import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { TaskComposeFormWhereTheWorkWhereTheWork } from "./TaskComposeFormWhereTheWorkWhereTheWork";
import { TaskComposeFormWhereTheWorkTimeRequired } from "./TaskComposeFormWhereTheWorkTimeRequired";

// Section of TaskComposeForm, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: any;
  activeField: any;
  calculatedFare: any;
  customHours: any;
  customMinutes: any;
  description: any;
  dropoffLocation: any;
  durationMode: any;
  goToBidding: any;
  handleSearch: any;
  handleUseCurrentLocation: any;
  insets: any;
  isProceedDisabled: any;
  offer: any;
  pickupLocation: any;
  searchResults: any[];
  selectResult: any;
  setActiveField: React.Dispatch<React.SetStateAction<any>>;
  setCustomHours: React.Dispatch<React.SetStateAction<number>>;
  setCustomMinutes: React.Dispatch<React.SetStateAction<number>>;
  setDescription: React.Dispatch<React.SetStateAction<any>>;
  setDurationMode: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  suggestedHigh: any;
  suggestedLow: any;
  tokens: any;
}

export function TaskComposeFormWhereTheWork(props: Props) {
  const { calculatedFare, goToBidding, insets, isProceedDisabled, styles, suggestedHigh, suggestedLow } = props;
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
      <Animated.Text style={styles.headline} entering={fadeInUp(0)}>What do you need?</Animated.Text>

      <TaskComposeFormWhereTheWorkWhereTheWork {...props} />

      <TaskComposeFormWhereTheWorkTimeRequired {...props} />
    </ScrollView>

    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {calculatedFare > 0 && (
        <View style={styles.suggestedRow}>
          <Text style={styles.suggestedLabel}>Suggested offer</Text>
          <Text style={styles.suggestedValue}>₹{suggestedLow} – ₹{suggestedHigh}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.primaryBtn, isProceedDisabled && { opacity: 0.5 }]} disabled={isProceedDisabled} onPress={goToBidding}>
        <Text style={styles.primaryBtnText}>Set your offer</Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
