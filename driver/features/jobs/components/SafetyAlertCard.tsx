import React from "react";

import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";
import { AppImage } from "@/components/ui/AppImage";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Road/weather advisory shown at the bottom of the home screen. */
export function SafetyAlertCard({ title, message }: { title: string; message: string }) {
  return (
    <Box style={styles.safetyAlert}>
      <Feather
        name="alert-triangle"
        size={moderateScale(24)}
        color={Colors.amber}
        style={{ marginTop: 2 }}
      />
      <Box style={styles.safetyContent}>
        <AppText style={styles.safetyTitle}>{title}</AppText>
        <AppText style={styles.safetyText}>{message}</AppText>
      </Box>
      <AppImage
        source={require("../../../assets/images/safety_cones.png")}
        style={styles.safetyImg}
        resizeMode="contain"
      />
    </Box>
  );
}
