import React from "react";

import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Pinned footer with the save/update action. */
export function AddressSaveBar({
  label,
  loading,
  onPress,
  paddingBottom,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
  paddingBottom: number;
}) {
  return (
    <Box style={[styles.footer, { paddingBottom }]}>
      <Touchable
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <Loader size="small" color={Colors.white} />
        ) : (
          <AppText style={styles.saveBtnText}>{label}</AppText>
        )}
      </Touchable>
    </Box>
  );
}
