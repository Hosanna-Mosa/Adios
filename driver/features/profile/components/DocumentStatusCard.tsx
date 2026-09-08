import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "../profile-tab.styles";

/** One document tile: icon, name, and a validity pill. */
export function DocumentStatusCard({
  icon,
  title,
  status,
  tone,
  toneSurface,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  status: string;
  tone: string;
  toneSurface: string;
}) {
  return (
    <View style={[styles.docCard, { backgroundColor: toneSurface }]}>
      <View style={styles.docIconWrap}>
        <Feather name={icon} size={24} color={tone} />
      </View>
      <Text style={styles.docTitle}>{title}</Text>
      <View style={[styles.statusPill, { backgroundColor: toneSurface }]}>
        <Text style={[styles.statusPillText, { color: tone }]}>{status}</Text>
      </View>
    </View>
  );
}
