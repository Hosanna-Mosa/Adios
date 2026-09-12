import React from "react";

import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { styles } from "../auth.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Logo, app name and tagline above the sign-in form. */
export function AuthBrandHeader({ appName, tagline }: { appName: string; tagline: string }) {
  return (
    <Box style={styles.logoSection}>
      <Box style={styles.logoContainer}>
        <Feather name="truck" size={moderateScale(40)} color={Colors.white} />
      </Box>
      <AppText style={styles.appName}>{appName}</AppText>
      <AppText style={styles.tagline}>{tagline}</AppText>
    </Box>
  );
}
