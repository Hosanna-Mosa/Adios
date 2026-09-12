import React from "react";

import { styles } from "../onboarding.styles";
import { Box } from "@/components/ui/Box";

/** One bar per section in the current step; filled behind, highlighted at. */
export function SectionProgressBar({
  sections,
  currentIndex,
}: {
  sections: { key: string }[];
  currentIndex: number;
}) {
  return (
    <Box style={styles.sectionProgress}>
      {sections.map((section, i) => (
        <Box
          key={section.key}
          style={[
            styles.sectionBar,
            i < currentIndex && styles.sectionBarDone,
            i === currentIndex && styles.sectionBarActive,
          ]}
        />
      ))}
    </Box>
  );
}
