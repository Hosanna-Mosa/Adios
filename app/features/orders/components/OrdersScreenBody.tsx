import { RefreshControl, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { OrdersBody } from "@/features/orders/components/OrdersBody";
import { AppTabBar } from "@/components/AppTabBar";
import { fadeInUp } from "@/motion/presets";
import { ScheduledOrdersList } from "@/features/orders/components/ScheduledOrdersList";
import { ActiveOrdersList } from "@/features/orders/components/ActiveOrdersList";
import { PastOrdersList } from "@/features/orders/components/PastOrdersList";
import { OrdersEmptyWrap } from "@/features/orders/components/OrdersEmptyWrap";
import { OrdersServiceChip } from "@/features/orders/components/OrdersServiceChip";
import { OrdersAllChip } from "@/features/orders/components/OrdersAllChip";
import { RIDE_TYPES } from "@/features/orders/useOrders";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "@/features/orders/orders.styles";
import type { Order } from "@/types/models";
import { SERVICE_CHIPS, isChipActive } from "../useOrders.shared";

// Markup moved out of (tabs)/orders.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  tabBarHeight: number;
  tokens: ThemeTokens;
  styles: OrdersStyles;
  orders: Order[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  serviceFilters: any;
  setServiceFilters: any;
  reorderingId: any;
  scheduled: Order[];
  active: Order[];
  past: Order[];
  handleOpenReviewModal: any;
  handleReorder: any;
  isEmpty: boolean;
  scheduledSlot: any;
  SCHEDULE_PILL: any;
  SERVICE_META: any;
  activeStatusCaption: any;
  /** A search is active (the lists above are already filtered by it). */
  searching?: boolean;
}

export function OrdersScreenBody({
  tabBarHeight,
  tokens,
  styles,
  orders,
  loading,
  refreshing,
  onRefresh,
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
  searching,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    {loading ? (
      <OrdersBody
        styles={styles}
      />
    ) : (
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.brand} />}
      >
        <Animated.View style={styles.chipsRow} entering={fadeInUp(40)}>
          <OrdersAllChip
            serviceFilters={serviceFilters}
            setServiceFilters={setServiceFilters}
            styles={styles}
            tokens={tokens}
          />
          {SERVICE_CHIPS.map((chip) => (
            <OrdersServiceChip
              key={chip.label}
              label={t(chip.labelKey, { defaultValue: chip.label })}
              icon={chip.icon}
              serviceKeys={chip.keys}
              isActive={isChipActive(serviceFilters, chip.keys)}
              setServiceFilters={setServiceFilters}
              styles={styles}
              tokens={tokens}
            />
          ))}
        </Animated.View>

        {scheduled.length > 0 && (
          <ScheduledOrdersList
            SCHEDULE_PILL={SCHEDULE_PILL}
            SERVICE_META={SERVICE_META}
            scheduledSlot={scheduledSlot}
            scheduled={scheduled}
            styles={styles}
            tokens={tokens}
          />
        )}

        {active.length > 0 && (
          <ActiveOrdersList
            SERVICE_META={SERVICE_META}
            activeStatusCaption={activeStatusCaption}
            active={active}
            styles={styles}
            tokens={tokens}
          />
        )}

        {scheduled.length === 0 && active.length === 0 && past.length === 0 && (
          <OrdersEmptyWrap
            serviceFilters={serviceFilters}
            searching={searching}
            styles={styles}
            tokens={tokens}
          />
        )}

        {past.length > 0 && (
          <PastOrdersList
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
