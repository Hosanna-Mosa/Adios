import React from "react";

import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { styles } from "../profile-tab.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Placeholder card while the profile loads. */
export function ProfileLoadingCard() {
  return <SkeletonCard style={styles.loadingCard} />;
}

/** Placeholder card when the profile could not be loaded. */
export function ProfileUnavailableCard({ message }: { message: string }) {
  return (
    <Box style={styles.loadingCard}>
      <AppText style={styles.emptyText}>{message}</AppText>
    </Box>
  );
}
