import React from "react";
import { Box } from "@/components/ui/Box";
import { Skeleton } from "@/components/ui/Skeleton";
import { styles } from "../orders.styles";

/** Placeholder cards while the first page loads. */
export function OrdersSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Box>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i} style={styles.skelCard}>
          <Box style={styles.skelRow}>
            <Skeleton width={42} height={42} radius={10} />
            <Box style={{ flex: 1, gap: 8 }}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={11} />
            </Box>
            <Skeleton width={70} height={22} radius={999} />
          </Box>
          <Skeleton width="90%" height={14} />
          <Skeleton width="75%" height={14} />
          <Skeleton width="100%" height={36} />
        </Box>
      ))}
    </Box>
  );
}
