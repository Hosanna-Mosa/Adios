import { ScrollView, View } from "react-native";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  styles: OrdersStyles;
}

export function OrdersBody({
  styles,
}: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, gap: 12 }}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={[styles.skeletonBar, { width: "22%", height: 11, marginBottom: 12 }]} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.skeletonBar, { width: 52, height: 52, borderRadius: 8 }]} />
            <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
              <View style={[styles.skeletonBar, { width: "56%", height: 14 }]} />
              <View style={[styles.skeletonBar, { width: "74%", height: 12 }]} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
