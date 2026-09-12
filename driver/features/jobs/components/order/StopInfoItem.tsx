import React from "react";

import type { StyleProp, TextStyle } from "react-native";
import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One stop in the job's info panel: what it is, who's there, and where.
 *
 * `layout="row"` keeps the original flex-row wrapper used wherever contact
 * buttons sit beside the address — including the one place the wrapper exists
 * with no buttons in it, where dropping it would lose the right margin. */
export function StopInfoItem({
  label,
  name,
  address,
  layout = "stacked",
  actions,
  nameStyle,
}: {
  label: string;
  name: React.ReactNode;
  address?: React.ReactNode;
  layout?: "stacked" | "row";
  actions?: React.ReactNode;
  /** Emphasis on the value, e.g. the payout figure. */
  nameStyle?: StyleProp<TextStyle>;
}) {
  const copy = (
    <>
      <AppText style={styles.infoLabel}>{label}</AppText>
      <AppText style={[styles.infoText, nameStyle]}>{name}</AppText>
      {address !== undefined && <AppText style={styles.subText}>{address}</AppText>}
    </>
  );

  return (
    <Box style={styles.infoItem}>
      {layout === "row" ? (
        <Box style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box style={{ flex: 1, marginRight: 8 }}>{copy}</Box>
          {actions}
        </Box>
      ) : (
        copy
      )}
    </Box>
  );
}
