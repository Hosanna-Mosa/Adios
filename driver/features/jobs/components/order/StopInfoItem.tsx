import React from "react";
import { Text, View } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { styles } from "../../active-order.styles";

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
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoText, nameStyle]}>{name}</Text>
      {address !== undefined && <Text style={styles.subText}>{address}</Text>}
    </>
  );

  return (
    <View style={styles.infoItem}>
      {layout === "row" ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, marginRight: 8 }}>{copy}</View>
          {actions}
        </View>
      ) : (
        copy
      )}
    </View>
  );
}
