import React from "react";

import { validationErrorStyles as styles } from "./ValidationErrorBox.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Red box explaining why an entered ID number is not valid.
 * The same markup sat inline three times on the identity screen. */
export function ValidationErrorBox({ message }: { message: string }) {
  return (
    <Box style={styles.box}>
      <AppText style={styles.text}>{message}</AppText>
    </Box>
  );
}
