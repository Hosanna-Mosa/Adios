import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { type OrdersStyles } from "../orders.styles";

const FALLBACK: Record<string, number> = {
  food: require("@/assets/images/services/food_3d.png"),
  meat: require("@/assets/images/services/meat_3d.png"),
  bike: require("@/assets/images/services/ride_3d.png"),
  auto: require("@/assets/images/services/ride_3d.png"),
  cab: require("@/assets/images/services/ride_3d.png"),
  cab_prime: require("@/assets/images/services/ride_3d.png"),
  packageDelivery: require("@/assets/images/services/package_3d.png"),
  delivery: require("@/assets/images/services/package_3d.png"),
  helper: require("@/assets/images/services/helper_3d.png"),
};

/** The picture at the start of an order card: the outlet's photo, else the service's artwork. */
export function CardThumb({ order, serviceKey, background, styles }: { order: any; serviceKey: string; background: string; styles: OrdersStyles }) {
  const [failed, setFailed] = useState(false);
  const uri = typeof order?.vendor === "object" ? order.vendor?.image : undefined;
  const useRemote = !!uri && !failed;
  return (
    <View style={[styles.cardThumb, { backgroundColor: background }]}>
      <Image
        source={useRemote ? { uri } : (FALLBACK[serviceKey] ?? FALLBACK.delivery)}
        style={{ width: "100%", height: "100%" }}
        contentFit={useRemote ? "cover" : "contain"}
        transition={200}
        recyclingKey={String(order?._id)}
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
