import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { TaskComposeFormWhereTheWork } from "./TaskComposeFormWhereTheWork";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

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

export function TaskComposeForm(props: Props) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TaskComposeFormWhereTheWork {...props} />
    </KeyboardAvoidingView>
  );
}
