import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { OrdersHeader } from "@/features/orders/components/OrdersHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useOrders } from "@/features/orders/useOrders";
import type { ThemeTokens } from "@/constants/colors";
import { OrdersScreenBody } from "@/features/orders/components/OrdersScreenBody";
import { OrdersSheets } from "@/features/orders/components/OrdersSheets";

export default function OrdersScreen() {
  const {
  insets, tabBarHeight, tokens, styles, orders, loading, refreshing, onRefresh, serviceFilters, setServiceFilters,
  showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters,
  reorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating,
  reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, scheduled, active,
  past, serviceCounts, handleOpenReviewModal, handleSubmitReview, handleReorder, openFilterSheet,
  applyFilters, toggleServiceFilter, pendingCount, isEmpty
  } = useOrders();
  const { t } = useTranslation();

  const SCHEDULE_PILL: Record<string, string> = useMemo(() => ({
    pending: t("app.schedulePill.awaitingRestaurant"),
    accepted: t("app.schedulePill.confirmed"),
    rejected: t("app.schedulePill.rejected"),
  }), [t]);

  const SERVICE_META: Record<string, { label: string; accent: keyof ThemeTokens["services"] }> = useMemo(() => ({
    food: { label: t("app.serviceMeta.food"), accent: "food" },
    meat: { label: t("app.serviceMeta.meat"), accent: "meat" },
    bike: { label: t("app.serviceMeta.ride"), accent: "ride" },
    auto: { label: t("app.serviceMeta.ride"), accent: "ride" },
    cab: { label: t("app.serviceMeta.ride"), accent: "ride" },
    cab_prime: { label: t("app.serviceMeta.ride"), accent: "ride" },
    helper: { label: t("app.serviceMeta.task"), accent: "task" },
    delivery: { label: t("app.serviceMeta.delivery"), accent: "delivery" },
  }), [t]);

  const REVIEW_TAGS = useMemo(() => [
    t("app.reviewTags.onTime"),
    t("app.reviewTags.politePartner"),
    t("app.reviewTags.greatQuality"),
    t("app.reviewTags.wellPackaged"),
    t("app.reviewTags.safeTrip"),
  ], [t]);

  return (
    <ScreenShell>
      <OrdersHeader
        insets={insets}
        summary={
          loading || isEmpty
            ? undefined
            : [
                active.length ? t("app.orders.activeCount", { count: active.length, defaultValue: "{{count}} active" }) : null,
                scheduled.length ? t("app.orders.scheduledCount", { count: scheduled.length, defaultValue: "{{count}} scheduled" }) : null,
                past.length ? t("app.orders.pastCount", { count: past.length, defaultValue: "{{count}} past" }) : null,
              ].filter(Boolean).join(" · ")
        }
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

// SCHEDULE_PILL, SERVICE_META and REVIEW_TAGS moved inside OrdersScreen() as
// useMemo values so their labels can call t() — see
// ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md, Section 11 ("Constants Migration
// Strategy"). Object/array keys (status codes, service ids) are untouched.

function activeStatusCaption(order: any, serviceKey: string): string {
  // Plain helper (not a hook) called from deep inside the render tree via a
  // prop reference, so it uses the shared i18n instance's t() directly
  // instead of the useTranslation() hook — see app/i18n.ts.
  const status = String(order.status || "").toUpperCase();
  // A restaurant food order the restaurant hasn't accepted yet (it has 2 minutes).
  if (order.dispatchMode === "broadcast" && status === "CREATED" && !order.restaurantAcceptedAt) {
    return i18n.t("app.orders.waitingForRestaurant");
  }
  if (serviceKey === "food" || serviceKey === "meat") {
    if (["EN_ROUTE_DELIVERY", "PICKED_UP", "ON_THE_WAY"].includes(status)) return i18n.t("app.tracking.deliveryLabels.outForDelivery", "Out for delivery");
    if (["PICKING_ITEMS", "ARRIVED_PICKUP"].includes(status)) return i18n.t("app.orders.preparingYourOrder", "Preparing your order");
    // Accepted by the restaurant, which is cooking it while a delivery partner is found.
    if (order.dispatchMode === "broadcast" && status === "SEARCHING_DRIVER") return i18n.t("app.orders.preparingYourOrder", "Preparing your order");
    return i18n.t("app.chat.statusLabel.confirmed", "Order confirmed");
  }
  if (serviceKey === "helper") {
    // A helper task's own statuses: SEARCHING_DRIVER → DRIVER_ASSIGNED → IN_PROGRESS → DELIVERED.
    if (status === "DRIVER_ASSIGNED") return i18n.t("app.orders.helperAssigned", "Helper assigned");
    if (status === "IN_PROGRESS") return i18n.t("app.orders.taskInProgress", "Task in progress");
    if (["DELIVERED", "COMPLETED"].includes(status)) return i18n.t("app.orders.taskCompleted", "Task completed");
    if (status === "CANCELLED") return i18n.t("app.orders.cancelled", "Cancelled");
    return i18n.t("app.orders.findingAHelper", "Finding a helper");
  }
  if (serviceKey === "delivery") return i18n.t("app.orders.riderOnTheRoute", "Rider on the route");
  if (["DRIVER_ASSIGNED", "driver_assigned"].includes(status)) return i18n.t("app.tracking.rideLabels.captainAssigned", "Rider assigned");
  return i18n.t("app.orders.findingYourCaptain", "Finding your rider");
}
