import React from "react";
import { Image, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";

/** Road/weather advisory shown at the bottom of the home screen. */
export function SafetyAlertCard({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.safetyAlert}>
      <Feather
        name="alert-triangle"
        size={moderateScale(24)}
        color={Colors.amber}
        style={{ marginTop: 2 }}
      />
      <View style={styles.safetyContent}>
        <Text style={styles.safetyTitle}>{title}</Text>
        <Text style={styles.safetyText}>{message}</Text>
      </View>
      <Image
        source={require("../../../assets/images/safety_cones.png")}
        style={styles.safetyImg}
        resizeMode="contain"
      />
    </View>
  );
}
