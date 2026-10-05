import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

/** Placeholder with OrderCard's shape, shown while orders load. */
export function OrderCardSkeleton({ count = 3 }: { count?: number }) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Skeleton width={40} height={40} radius={12} />
            <View style={styles.texts}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={12} />
            </View>
            <Skeleton width={56} height={14} />
          </View>
          <Skeleton width="70%" height={12} />
          <Skeleton width={110} height={22} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    list: { gap: 12 },
    card: {
      backgroundColor: tokens.surface,
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: radius.md,
      padding: 14,
      gap: 12,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    texts: { flex: 1, gap: 6 },
  });
