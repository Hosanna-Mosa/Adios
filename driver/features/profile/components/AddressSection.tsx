import React from "react";
import { Text, View } from "react-native";
import { styles } from "../add-address.styles";

/** Titled group of fields on the address form. */
export function AddressSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
