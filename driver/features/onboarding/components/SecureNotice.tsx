import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";

/** Reassurance panel at the top of the payout form. */
export function SecureNotice({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeIcon}>
        <Feather name="shield" size={17} color={Colors.success} />
      </View>
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeText}>{text}</Text>
      </View>
    </View>
  );
}
