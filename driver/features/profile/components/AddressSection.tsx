import React from "react";

import { styles } from "../add-address.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Titled group of fields on the address form. */
export function AddressSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </Box>
  );
}
