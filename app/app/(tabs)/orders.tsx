import { OrdersBody } from "@/features/orders/components/OrdersBody";
import { OrdersFilterSheet } from "@/features/orders/components/OrdersFilterSheet";
import { OrderReviewSheet } from "@/features/orders/components/OrderReviewSheet";
import { ScrollView, Text } from "react-native";
import Animated from "react-native-reanimated";
import { AppTabBar } from "@/components/AppTabBar";
import { fadeInDown, fadeInUp } from "@/motion/presets";
import { OrdersSection } from "@/features/orders/components/OrdersSection";
import { OrdersSection2 } from "@/features/orders/components/OrdersSection2";
import { OrdersSection3 } from "@/features/orders/components/OrdersSection3";
import { OrdersEmptyWrap } from "@/features/orders/components/OrdersEmptyWrap";
import { OrdersChip } from "@/features/orders/components/OrdersChip";
import { OrdersChip2 } from "@/features/orders/components/OrdersChip2";
import { OrdersChip3 } from "@/features/orders/components/OrdersChip3";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useOrders } from "@/features/orders/useOrders";
import type { ThemeTokens } from "@/constants/colors";
import { RIDE_TYPES } from "@/features/orders/useOrders";
import { OrdersSection4 } from "@/features/orders/components/OrdersSection4";
import { OrdersSection5 } from "@/features/orders/components/OrdersSection5";

export default function OrdersScreen() {
  const {
  insets, tabBarHeight, tokens, styles, orders, loading, refreshing, onRefresh, serviceFilters, setServiceFilters,
  showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters,
  reorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating,
  reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, scheduled, active,
  past, serviceCounts, handleOpenReviewModal, handleSubmitReview, handleReorder, openFilterSheet,
  applyFilters, toggleServiceFilter, pendingCount, isEmpty
  } = useOrders();

  return (
    <ScreenShell>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
        <Text style={styles.headline}>My orders</Text>
        <OrdersChip
          openFilterSheet={openFilterSheet}
          styles={styles}
          tokens={tokens}
        />
      </Animated.View>

      <OrdersSection4
        tabBarHeight={tabBarHeight}
        tokens={tokens}
        styles={styles}
        orders={orders}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        serviceFilters={serviceFilters}
        setServiceFilters={setServiceFilters}
        reorderingId={reorderingId}
        scheduled={scheduled}
        active={active}
        past={past}
        handleOpenReviewModal={handleOpenReviewModal}
        handleReorder={handleReorder}
        isEmpty={isEmpty}
        scheduledSlot={scheduledSlot}
        SCHEDULE_PILL={SCHEDULE_PILL}
        SERVICE_META={SERVICE_META}
        activeStatusCaption={activeStatusCaption}
      />
      <OrdersSection5
        tokens={tokens}
        styles={styles}
        orders={orders}
        showFilterSheet={showFilterSheet}
        setShowFilterSheet={setShowFilterSheet}
        pendingServiceFilters={pendingServiceFilters}
        setPendingServiceFilters={setPendingServiceFilters}
        selectedOrderForReview={selectedOrderForReview}
        setSelectedOrderForReview={setSelectedOrderForReview}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewTags={reviewTags}
        setReviewTags={setReviewTags}
        submittingReview={submittingReview}
        serviceCounts={serviceCounts}
        handleSubmitReview={handleSubmitReview}
        applyFilters={applyFilters}
        toggleServiceFilter={toggleServiceFilter}
        pendingCount={pendingCount}
        SERVICE_META={SERVICE_META}
        REVIEW_TAGS={REVIEW_TAGS}
      />
    </ScreenShell>
  );
}

function scheduledSlot(order: any): Date | null {
  const raw = order?.scheduledFor || order?.scheduledDelivery?.requestedAt || order?.reservedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

const SCHEDULE_PILL: Record<string, string> = {
  pending: "Awaiting restaurant",
  accepted: "Confirmed",
  rejected: "Rejected",
};

const SERVICE_META: Record<string, { label: string; accent: keyof ThemeTokens["services"] }> = {
  food: { label: "Food", accent: "food" },
  meat: { label: "Meat", accent: "meat" },
  bike: { label: "Ride", accent: "ride" },
  auto: { label: "Ride", accent: "ride" },
  cab: { label: "Ride", accent: "ride" },
  cab_prime: { label: "Ride", accent: "ride" },
  helper: { label: "Task", accent: "task" },
  delivery: { label: "Delivery", accent: "delivery" },
};

const REVIEW_TAGS = ["⚡ On time", "😊 Polite partner", "🍱 Great quality", "📦 Well packaged", "🚗 Safe trip"];

function activeStatusCaption(order: any, serviceKey: string): string {
  const status = String(order.status || "").toUpperCase();
  if (serviceKey === "food" || serviceKey === "meat") {
    if (["EN_ROUTE_DELIVERY", "PICKED_UP", "ON_THE_WAY"].includes(status)) return "Out for delivery";
    if (["PICKING_ITEMS", "ARRIVED_PICKUP"].includes(status)) return "Preparing your order";
    return "Order confirmed";
  }
  if (serviceKey === "helper") {
    if (["EN_ROUTE_PICKUP", "DRIVER_ASSIGNED", "driver_assigned"].includes(status)) return "Helper on the way";
    return "Matching a helper";
  }
  if (serviceKey === "delivery") return "Rider on the route";
  if (["DRIVER_ASSIGNED", "driver_assigned"].includes(status)) return "Captain assigned";
  return "Finding your captain";
}
