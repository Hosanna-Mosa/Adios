import React from "react";

import type { Field } from "../utils/format";
import { fieldRowStyles as styles } from "./FieldRow.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One read-only label/value line in a profile detail section. */
export function FieldRow({ label, value }: Field) {
  return (
    <Box style={styles.fieldRow}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <AppText style={styles.fieldValue}>{value}</AppText>
    </Box>
  );
}
