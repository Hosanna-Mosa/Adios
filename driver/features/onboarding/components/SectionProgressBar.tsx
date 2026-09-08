import React from "react";
import { View } from "react-native";
import { styles } from "../onboarding.styles";

/** One bar per section in the current step; filled behind, highlighted at. */
export function SectionProgressBar({
  sections,
  currentIndex,
}: {
  sections: { key: string }[];
  currentIndex: number;
}) {
  return (
    <View style={styles.sectionProgress}>
      {sections.map((section, i) => (
        <View
          key={section.key}
          style={[
            styles.sectionBar,
            i < currentIndex && styles.sectionBarDone,
            i === currentIndex && styles.sectionBarActive,
          ]}
        />
      ))}
    </View>
  );
}
