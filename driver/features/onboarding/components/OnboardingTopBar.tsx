import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../onboarding.styles";

/** Back arrow (only once there is somewhere to go back to) and Skip. */
export function OnboardingTopBar({
  canGoBack,
  onBack,
  onSkip,
}: {
  canGoBack: boolean;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.topBar}>
      {canGoBack ? (
        <TouchableOpacity onPress={onBack} style={styles.topBarBtn}>
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      <TouchableOpacity onPress={onSkip} style={styles.topBarBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
