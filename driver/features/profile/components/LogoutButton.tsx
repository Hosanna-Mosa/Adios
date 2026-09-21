import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

/** Destructive sign-out row at the bottom of the profile. */
export function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <Touchable style={styles.logoutButton} onPress={onPress}>
      <Feather name="log-out" size={20} color={Colors.error} />
      <AppText style={styles.logoutText}>Logout</AppText>
    </Touchable>
  );
}
