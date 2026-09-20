import React from "react";

import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Avatar initial beside a person's name and where they're headed.
 * Used at the ride and delivery in-transit stages. */
export function CustomerRow({
  initial,
  name,
  children,
  trailing,
}: {
  initial: string;
  name: string;
  /** The lines under the name — a destination on one stage, a phone on another. */
  children?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <Box style={styles.customerRowInside}>
      <Box style={styles.customerAvatarInside}>
        <AppText style={styles.customerInitialsInside}>{initial}</AppText>
      </Box>
      <Box style={{ flex: 1 }}>
        <AppText style={styles.customerNameInside}>{name}</AppText>
        {children}
      </Box>
      {trailing}
    </Box>
  );
}

/** Name + address on the left, contact buttons on the right. */
export function ContactHeaderRow({
  name,
  address,
  actions,
}: {
  name: React.ReactNode;
  address?: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <Box
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Box style={{ flex: 1, marginRight: 8 }}>
        <AppText style={styles.restaurantName}>{name}</AppText>
        <AppText style={styles.addressText}>{address}</AppText>
      </Box>
      <Box style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>{actions}</Box>
    </Box>
  );
}
