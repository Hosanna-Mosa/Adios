import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceKey } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { stepper } from "../orderCardHelpers";
import { OrderSteps } from "@/components/shared/OrderSteps";
import { CardThumb } from "./CardThumb";
import { OrderCardBody } from "./OrderCardBody";
import { StatusPill } from "./StatusPill";

interface Props {
  activeStatusCaption: (order: any, serviceKey: string) => string;
  SERVICE_META: Record<string, { label: string; accent: ServiceKey }>;
  active: any[];
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

/** A helper task nobody has started yet lives on the helper screen (raise the price, cancel, start OTP). */
const HELPER_PRE_START = ["CREATED", "SEARCHING_DRIVER", "DRIVER_ASSIGNED"];

/**
 * One white card per live order: picture and details on top (with the current step as a
 * blue pill), the step-by-step tracker underneath. The whole card opens tracking — or,
 * for a helper task that hasn't started, the helper screen.
 */
export function ActiveOrdersList({ active, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      <View style={[styles.band, { backgroundColor: tokens.successSkin }]}>
        <View style={styles.liveDot} />
        <Text style={styles.bandText}>{t("app.orders.activeLabel", "Active")}</Text>
      </View>
      {active.map((order, index) => {
        const key: string = order.__serviceKey;
        const opensHelperScreen = key === "helper" && HELPER_PRE_START.includes(String(order.status || "").toUpperCase());
        const openTracking = () =>
          router.push({ pathname: opensHelperScreen ? "/helper-task" : "/tracking", params: { orderId: order._id } });
        const steps = stepper(order, key);

        return (
          <Animated.View key={order._id} entering={staggerListItem(index)}>
            <TouchableOpacity style={styles.orderCard} activeOpacity={0.9} onPress={openTracking} accessibilityRole="button" accessibilityHint={t("app.orders.trackOrder")}>
              <View style={styles.orderTop}>
                <CardThumb order={order} serviceKey={key} background={tokens.sunken} styles={styles} />
                <OrderCardBody
                  order={order}
                  serviceKey={key}
                  styles={styles}
                  tokens={tokens}
                  badge={<StatusPill label={steps.labels[steps.current]} color={tokens.info} background={tokens.infoSkin} icon="ring" styles={styles} />}
                />
                <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.text} style={styles.cardChevron} />
              </View>
              <OrderSteps steps={steps} tokens={tokens} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
