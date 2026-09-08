import React from "react";
import { Text, View } from "react-native";
import type { Field } from "../utils/format";
import { fieldRowStyles as styles } from "./FieldRow.styles";

/** One read-only label/value line in a profile detail section. */
export function FieldRow({ label, value }: Field) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}
