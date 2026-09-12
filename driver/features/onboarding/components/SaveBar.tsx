import React from "react";

import { Colors } from "@/constants/colors";
import { styles } from "../payout-setup.styles";
import { Loader } from "@/components/ui/Loader";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Pinned bottom action bar with a single primary button. */
export function SaveBar({
  label,
  onPress,
  disabled,
  saving,
  paddingBottom,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  saving: boolean;
  paddingBottom: number;
}) {
  return (
    <Box style={[styles.bottomBar, { paddingBottom }]}>
      <PressBox
        style={[styles.saveButton, disabled && styles.saveButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        {saving ? (
          <Loader size="small" color={Colors.white} />
        ) : (
          <AppText style={styles.saveButtonText}>{label}</AppText>
        )}
      </PressBox>
    </Box>
  );
}
