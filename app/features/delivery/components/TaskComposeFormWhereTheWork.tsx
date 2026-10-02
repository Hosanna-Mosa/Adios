import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { TaskComposeFormWhereTheWorkWhereTheWork } from "./TaskComposeFormWhereTheWorkWhereTheWork";
import { TaskComposeFormWhereTheWorkTimeRequired } from "./TaskComposeFormWhereTheWorkTimeRequired";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Section of TaskComposeForm, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  activeField: any;
  calculatedFare: number;
  customHours: any;
  customMinutes: any;
  description: any;
  dropoffLocation: any;
  durationMode: any;
  goToBidding: any;
  handleSearch: any;
  handleUseCurrentLocation: () => void;
  insets: EdgeInsets;
  isProceedDisabled: boolean;
  offer: any;
  pickupLocation: any;
  searchResults: any[];
  selectResult: any;
  setActiveField: React.Dispatch<React.SetStateAction<any>>;
  setCustomHours: React.Dispatch<React.SetStateAction<number>>;
  setCustomMinutes: React.Dispatch<React.SetStateAction<number>>;
  setDescription: React.Dispatch<React.SetStateAction<any>>;
  setDurationMode: React.Dispatch<React.SetStateAction<any>>;
  styles: HelperTaskStyles;
  suggestedHigh: any;
  suggestedLow: any;
  tokens: ThemeTokens;
}

export function TaskComposeFormWhereTheWork(props: Props) {
  const { calculatedFare, goToBidding, insets, isProceedDisabled, styles, suggestedHigh, suggestedLow } = props;
  const { t } = useTranslation();
  return (
    <>
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
      <Animated.Text style={styles.headline} entering={fadeInUp(0)}>{t("app.delivery.whatDoYouNeed")}</Animated.Text>

      <TaskComposeFormWhereTheWorkWhereTheWork {...props} />

      <TaskComposeFormWhereTheWorkTimeRequired {...props} />
    </ScrollView>

    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {calculatedFare > 0 && (
        <View style={styles.suggestedRow}>
          <Text style={styles.suggestedLabel}>{t("app.delivery.suggestedOffer")}</Text>
          <Text style={styles.suggestedValue}>₹{suggestedLow} – ₹{suggestedHigh}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.primaryBtn, isProceedDisabled && { opacity: 0.5 }]} disabled={isProceedDisabled} onPress={goToBidding}>
        <Text style={styles.primaryBtnText}>{t("app.delivery.setYourOffer")}</Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
