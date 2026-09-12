import React from "react";

import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

/** "Use PAN Card instead →" style link that jumps to the other ID method. */
export function AlternateIdLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Touchable onPress={onPress} style={{ alignItems: "center", paddingVertical: 10 }}>
      <AppText style={{ fontSize: typography.sizes.medium, color: Colors.textMuted, fontWeight: "500" }}>{label}</AppText>
    </Touchable>
  );
}
