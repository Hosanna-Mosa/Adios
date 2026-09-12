import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { bankStyles } from "../onboarding.styles";

/** Warning shown while the two account numbers disagree. */
export function BankMismatchRow({ message }: { message: string }) {
  return (
    <View style={bankStyles.errorRow}>
      <Feather name="alert-circle" size={15} color={Colors.error} />
      <Text style={bankStyles.errorText}>{message}</Text>
    </View>
  );
}
