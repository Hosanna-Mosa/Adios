import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { cardTitle, fromAddress, helperTaskName, itemsLine, outletName, serviceIcon, toAddress, vehicleLabel, whenLabel } from "../orderCardHelpers";

interface Props {
  order: any;
  serviceKey: string;
  /** Right-hand element of the title row (status pill). */
  badge: ReactNode;
  /** Past cards add the order time to the total line. */
  showWhen?: boolean;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

const RIDE = ["bike", "auto", "cab", "cab_prime"];

/** Title row + detail lines of an order card; what the lines say depends on the service. */
export function OrderCardBody({ order, serviceKey, badge, showWhen, styles, tokens }: Props) {
  const { t } = useTranslation();
  const isOutlet = serviceKey === "food" || serviceKey === "meat";
  const isRide = RIDE.includes(serviceKey);
  const isPackage = serviceKey === "packageDelivery" || serviceKey === "delivery";
  const price = `₹${Math.round(order.totalPrice || 0)}`;
  const when = showWhen ? whenLabel(order.createdAt) : "";
  const from = fromAddress(order);
  const to = toAddress(order);
  const items = itemsLine(order, serviceKey);

  const route = (
    <>
      {!!from && (
        <View style={styles.routeRow}>
          <Ionicons name="ellipse" size={moderateScale(9)} color={tokens.success} />
          <Text style={styles.routeText} numberOfLines={1}>{t("app.orders.from", "From")}: {from}</Text>
        </View>
      )}
      {!!to && (
        <View style={styles.routeRow}>
          <Ionicons name="location" size={moderateScale(11)} color={tokens.error} />
          <Text style={styles.routeText} numberOfLines={1}>{t("app.orders.to", "To")}: {to}</Text>
        </View>
      )}
    </>
  );

  const total = [`${t("app.orders.total", "Total")}: ${price}`, when].filter(Boolean).join("   ·   ");

  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={styles.cardHead}>
        <Ionicons name={serviceIcon(serviceKey)} size={moderateScale(15)} color={tokens.brand} />
        <Text style={styles.cardTitleText} numberOfLines={1}>{cardTitle(serviceKey)}</Text>
        {badge}
      </View>

      {isOutlet && (
        <>
          <Text style={styles.cardName} numberOfLines={1}>{outletName(order)}</Text>
          {!!items && <Text style={styles.cardLine} numberOfLines={1}>{items}</Text>}
          <Text style={styles.cardTotal} numberOfLines={1}>{total}</Text>
        </>
      )}
      {isRide && (
        <>
          {route}
          <Text style={styles.cardTotal} numberOfLines={1}>
            {[vehicleLabel(serviceKey), price, when].filter(Boolean).join("   ·   ")}
          </Text>
        </>
      )}
      {isPackage && (
        <>
          {route}
          {!!items && <Text style={styles.cardLine} numberOfLines={1}>{items}</Text>}
          <Text style={styles.cardTotal} numberOfLines={1}>{total}</Text>
        </>
      )}
      {serviceKey === "helper" && (
        <>
          <Text style={styles.cardName} numberOfLines={1}>{helperTaskName(order)}</Text>
          <Text style={styles.cardTotal} numberOfLines={1}>{total}</Text>
        </>
      )}
    </View>
  );
}
