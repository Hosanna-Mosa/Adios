import React from "react";
import { ScrollView, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { Skeleton } from "@/components/ui/Skeleton";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// The orders loading state. It mirrors the real list — the same 20-radius card, row
// padding and 44pt icon tile — and shimmers through the shared Skeleton, so nothing
// jumps when the orders arrive. It used to be static cards with a 52px thumbnail at
// a 14 radius.

interface Props {
  styles: OrdersStyles;
}

const ROWS = [0, 1, 2];

export function OrdersBody({ styles }: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}>
      <View style={styles.listCard}>
        {ROWS.map((i) => (
          <React.Fragment key={i}>
            <View style={styles.row}>
              <Skeleton width={moderateScale(44)} height={moderateScale(44)} radius={moderateScale(14)} />
              <View style={{ flex: 1, gap: 8, paddingTop: 4 }}>
                <Skeleton width="56%" height={14} />
                <Skeleton width="74%" height={12} />
              </View>
            </View>
            {i < ROWS.length - 1 && <View style={styles.rowDivider} />}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}
