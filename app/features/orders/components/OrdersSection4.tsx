import { ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { OrdersBody } from "@/features/orders/components/OrdersBody";
import { AppTabBar } from "@/components/AppTabBar";
import { fadeInUp } from "@/motion/presets";
import { OrdersSection } from "@/features/orders/components/OrdersSection";
import { OrdersSection2 } from "@/features/orders/components/OrdersSection2";
import { OrdersSection3 } from "@/features/orders/components/OrdersSection3";
import { OrdersEmptyWrap } from "@/features/orders/components/OrdersEmptyWrap";
import { OrdersChip2 } from "@/features/orders/components/OrdersChip2";
import { OrdersChip3 } from "@/features/orders/components/OrdersChip3";
import { RIDE_TYPES } from "@/features/orders/useOrders";

// Markup moved out of (tabs)/orders.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  tabBarHeight: any;
  tokens: any;
  styles: any;
  orders: any;
  loading: any;
  serviceFilters: any;
  setServiceFilters: any;
  reorderingId: any;
  scheduled: any;
  active: any;
  past: any;
  handleOpenReviewModal: any;
  handleReorder: any;
  isEmpty: any;
  scheduledSlot: any;
  SCHEDULE_PILL: any;
  SERVICE_META: any;
  activeStatusCaption: any;
}

export function OrdersSection4({
  tabBarHeight,
  tokens,
  styles,
  orders,
  loading,
  serviceFilters,
  setServiceFilters,
  reorderingId,
  scheduled,
  active,
  past,
  handleOpenReviewModal,
  handleReorder,
  isEmpty,
  scheduledSlot,
  SCHEDULE_PILL,
  SERVICE_META,
  activeStatusCaption,
}: Props) {
  return (
    <>
    {loading ? (
      <OrdersBody
        styles={styles}
      />
    ) : isEmpty ? (
      <OrdersEmptyWrap
        orders={orders}
        styles={styles}
        tokens={tokens}
      />
    ) : (
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
        <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow} entering={fadeInUp(40)}>
          <OrdersChip3
            serviceFilters={serviceFilters}
            setServiceFilters={setServiceFilters}
            styles={styles}
          />
          {Object.entries(SERVICE_META).filter(([k]) => k !== "bike" && k !== "auto" && k !== "cab" && k !== "cab_prime").map(([key, meta]) => {
            const isActive = serviceFilters.has(key);
            return (
              <OrdersChip2
                isActive={isActive}
                key={key}
                meta={meta}
                setServiceFilters={setServiceFilters}
                styles={styles}
              />
            );
          })}
        </Animated.ScrollView>

        {scheduled.length > 0 && (
          <OrdersSection
            SCHEDULE_PILL={SCHEDULE_PILL}
            SERVICE_META={SERVICE_META}
            scheduledSlot={scheduledSlot}
            scheduled={scheduled}
            styles={styles}
            tokens={tokens}
          />
        )}

        {active.length > 0 && (
          <OrdersSection2
            SERVICE_META={SERVICE_META}
            activeStatusCaption={activeStatusCaption}
            active={active}
            styles={styles}
            tokens={tokens}
          />
        )}

        {past.length > 0 && (
          <OrdersSection3
            RIDE_TYPES={RIDE_TYPES}
            SERVICE_META={SERVICE_META}
            handleOpenReviewModal={handleOpenReviewModal}
            handleReorder={handleReorder}
            past={past}
            reorderingId={reorderingId}
            styles={styles}
            tokens={tokens}
          />
        )}
      </ScrollView>
    )}

    <AppTabBar active="orders" />

    {/* Filter sheet */}
    </>
  );
}
