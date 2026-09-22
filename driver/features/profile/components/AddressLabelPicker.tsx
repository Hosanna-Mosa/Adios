import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

const ICON_FOR: Record<string, keyof typeof Feather.glyphMap> = {
  Home: "home",
  Work: "briefcase",
};

// `opt` is the stored address label value (kept in English) — only the
// displayed chip text is translated.
const LABEL_KEY_FOR: Record<string, string> = {
  Home: "profile.addressLabelHome",
  Work: "profile.addressLabelWork",
  Other: "profile.addressLabelOther",
};

/** "Save as" chips — Home / Work / Other. */
export function AddressLabelPicker({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (label: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.section}>
      <AppText style={styles.sectionTitle}>{t("profile.saveAs")}</AppText>
      <Box style={styles.labelRow}>
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <Touchable
              key={opt}
              style={[styles.labelChip, isActive && styles.labelChipActive]}
              onPress={() => onSelect(opt)}
            >
              <Feather
                name={ICON_FOR[opt] || "map-pin"}
                size={14}
                color={isActive ? Colors.white : Colors.textSecondary}
              />
              <AppText style={[styles.labelChipText, isActive && styles.labelChipTextActive]}>
                {LABEL_KEY_FOR[opt] ? t(LABEL_KEY_FOR[opt]) : opt}
              </AppText>
            </Touchable>
          );
        })}
      </Box>
    </Box>
  );
}
