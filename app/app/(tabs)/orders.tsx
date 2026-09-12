import { OrdersHeader } from "@/features/orders/components/OrdersHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useOrders } from "@/features/orders/useOrders";
import type { ThemeTokens } from "@/constants/colors";
import { OrdersScreenBody } from "@/features/orders/components/OrdersScreenBody";
import { OrdersSheets } from "@/features/orders/components/OrdersSheets";

export default function OrdersScreen() {
  const {
  insets, tabBarHeight, tokens, styles, orders, loading, serviceFilters, setServiceFilters,
  showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters,
  reorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating,
  reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, scheduled, active,
  past, serviceCounts, handleOpenReviewModal, handleSubmitReview, handleReorder, openFilterSheet,
  applyFilters, toggleServiceFilter, pendingCount, isEmpty
  } = useOrders();

  return (
    <ScreenShell>
      <OrdersHeader
        insets={insets}
        openFilterSheet={openFilterSheet}
        styles={styles}
        tokens={tokens}
      />

      <OrdersScreenBody
        tabBarHeight={tabBarHeight}
        tokens={tokens}
        styles={styles}
        orders={orders}
        loading={loading}
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
      <OrdersSheets
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
