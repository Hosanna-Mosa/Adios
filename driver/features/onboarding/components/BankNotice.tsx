import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { bankStyles } from "../onboarding.styles";

/** Reassurance panel above the bank fields during onboarding.
 *
 * Deliberately NOT the payout screen's SecureNotice — that one uses a
 * different green and sets its weight via fontFamily rather than fontWeight,
 * so sharing them would change how one of the two screens looks. */
export function BankNotice({ title, text }: { title: string; text: string }) {
  return (
    <View style={bankStyles.notice}>
      <View style={bankStyles.noticeIcon}>
        <Feather name="shield" size={17} color={Colors.success} />
      </View>
      <View style={bankStyles.noticeCopy}>
        <Text style={bankStyles.noticeTitle}>{title}</Text>
        <Text style={bankStyles.noticeText}>{text}</Text>
      </View>
    </View>
  );
}
