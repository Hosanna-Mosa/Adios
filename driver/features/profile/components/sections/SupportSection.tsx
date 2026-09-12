import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { SectionFieldRows } from "../SectionFieldRows";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** How to reach support, shown under the account fields. */
export function SupportSection({ fields }: { fields: Field[] }) {
  return (
    <Box>
      <SectionFieldRows fields={fields} />
      <Box style={modalStyles.supportBox}>
        <Feather name="headphones" size={20} color={Colors.primary} />
        <AppText style={modalStyles.supportTitle}>Need help?</AppText>
        <AppText style={modalStyles.supportText}>
          Contact our support team at support@triozen.com or call us at
          +91-XXXXX-XXXXX for assistance.
        </AppText>
      </Box>
    </Box>
  );
}
