import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { styles } from "../auth.styles";

/** Logo, app name and tagline above the sign-in form. */
export function AuthBrandHeader({ appName, tagline }: { appName: string; tagline: string }) {
  return (
    <View style={styles.logoSection}>
      <View style={styles.logoContainer}>
        <Feather name="truck" size={moderateScale(40)} color={Colors.white} />
      </View>
      <Text style={styles.appName}>{appName}</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}
