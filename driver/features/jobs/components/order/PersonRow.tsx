import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../active-order.styles";

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
    <View style={styles.customerRowInside}>
      <View style={styles.customerAvatarInside}>
        <Text style={styles.customerInitialsInside}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.customerNameInside}>{name}</Text>
        {children}
      </View>
      {trailing}
    </View>
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
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.restaurantName}>{name}</Text>
        <Text style={styles.addressText}>{address}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>{actions}</View>
    </View>
  );
}
