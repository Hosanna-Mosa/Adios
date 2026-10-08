import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type OrdersStyles } from "../orders.styles";

interface Props {
  order: any;
  /** Shown when the order has no outlet photo (rides, tasks, package deliveries) or it fails to load. */
  icon: keyof typeof Ionicons.glyphMap;
  background: string;
  color: string;
  /** Cancelled orders: the photo is faded like the icon tile's muted colours. */
  dimmed?: boolean;
  styles: OrdersStyles;
}

/**
 * The square at the start of every order row/card: the restaurant or meat shop's
 * photo (GET /orders sends it on `order.vendor.image`), otherwise the service icon.
 */
export function OrderThumb({ order, icon, background, color, dimmed, styles }: Props) {
  const [failed, setFailed] = useState(false);
  const uri = typeof order?.vendor === "object" ? order.vendor?.image : undefined;

  if (uri && !failed) {
    return (
      <View style={[styles.iconTile, { backgroundColor: background, overflow: "hidden" }]}>
        <Image
          source={{ uri }}
          style={[styles.thumbImage, dimmed && { opacity: 0.45 }]}
          contentFit="cover"
          transition={200}
          recyclingKey={String(order._id)}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View style={[styles.iconTile, { backgroundColor: background }]}>
      <Ionicons name={icon} size={moderateScale(20)} color={color} />
    </View>
  );
}
