import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { SectionFieldRows } from "../SectionFieldRows";

/** Vehicle details — read-only, changed only through onboarding. */
export function VehicleSection({ fields }: { fields: Field[] }) {
  return (
    <View>
      <SectionFieldRows fields={fields} />
      <View style={modalStyles.infoBox}>
        <Feather name="info" size={14} color={Colors.textMuted} />
        <Text style={modalStyles.infoText}>
          Vehicle details can only be updated through the onboarding process.
        </Text>
      </View>
    </View>
  );
}
