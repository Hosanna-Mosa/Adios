import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { SectionFieldRows } from "../SectionFieldRows";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Vehicle details — read-only, changed only through onboarding. */
export function VehicleSection({ fields }: { fields: Field[] }) {
  return (
    <Box>
      <SectionFieldRows fields={fields} />
      <Box style={modalStyles.infoBox}>
        <Feather name="info" size={14} color={Colors.textMuted} />
        <AppText style={modalStyles.infoText}>
          Vehicle details can only be updated through the onboarding process.
        </AppText>
      </Box>
    </Box>
  );
}
