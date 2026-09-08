import React from "react";
import { Text, View } from "react-native";
import { validationErrorStyles as styles } from "./ValidationErrorBox.styles";

/** Red box explaining why an entered ID number is not valid.
 * The same markup sat inline three times on the identity screen. */
export function ValidationErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}
