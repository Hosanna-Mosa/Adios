import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "./Badge";

export interface ChipOption {
  key: string;
  label: string;
}

interface Props {
  options: ChipOption[];
  value: string;
  onChange: (key: string) => void;
  /** Colour of the selected chip. Defaults to the brand colour. */
  accent?: { accent: string; on: string };
  /** Space above the row — 0 when it sits right under a title. */
  topGap?: number;
}

/** A horizontally scrolling row of single-choice filter chips. */
export function ChipRow({ options, value, onChange, accent, topGap = 12 }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={[styles.content, { paddingTop: topGap }]}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => (
        <Chip key={option.key} label={option.label} selected={value === option.key} onPress={() => onChange(option.key)} accent={accent} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A horizontal ScrollView in a column grows vertically unless told not to.
  row: { flexGrow: 0, flexShrink: 0 },
  content: { gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
});
