import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { SectionFieldRows } from "../SectionFieldRows";

/** How to reach support, shown under the account fields. */
export function SupportSection({ fields }: { fields: Field[] }) {
  return (
    <View>
      <SectionFieldRows fields={fields} />
      <View style={modalStyles.supportBox}>
        <Feather name="headphones" size={20} color={Colors.primary} />
        <Text style={modalStyles.supportTitle}>Need help?</Text>
        <Text style={modalStyles.supportText}>
          Contact our support team at support@triozen.com or call us at
          +91-XXXXX-XXXXX for assistance.
        </Text>
      </View>
    </View>
  );
}
