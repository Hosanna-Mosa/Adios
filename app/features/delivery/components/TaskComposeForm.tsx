import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { TaskComposeFormWhereTheWork } from "./TaskComposeFormWhereTheWork";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  TASK_TYPES: any[];
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
  setTaskType: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  suggestedHigh: any;
  suggestedLow: any;
  taskType: any;
  tokens: any;
}

export function TaskComposeForm(props: Props) {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TaskComposeFormWhereTheWork {...props} />
    </KeyboardAvoidingView>
  );
}
