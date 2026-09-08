import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../chat.styles";

/** Chat header: back, customer identity with online dot, and the call button. */
export function CustomerChatHeader({
  customerName,
  paddingTop,
  onBack,
  onCall,
}: {
  customerName: string;
  paddingTop: number;
  onBack: () => void;
  onCall: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={22} color={Colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <View style={styles.headerAvatar}>
          <Feather name="user" size={20} color={Colors.textSecondary} />
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.headerName}>{customerName}</Text>
          <Text style={styles.headerStatus}>Customer � Online</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.callBtn} onPress={onCall}>
        <Feather name="phone" size={20} color={Colors.brand} />
      </TouchableOpacity>
    </View>
  );
}
