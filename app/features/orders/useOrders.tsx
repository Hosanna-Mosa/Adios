import { useOrdersInsets } from "./useOrdersInsets";
import { useOrdersScheduled } from "./useOrdersScheduled";
import { useOrdersHandleReorder } from "./useOrdersHandleReorder";
import { useOrdersOpenFilterSheet } from "./useOrdersOpenFilterSheet";
export { RIDE_TYPES } from "./useOrders.shared";

// State, data loading and handlers for app/(tabs)/orders.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// Inverted on purpose. In-flight statuses are written in both cases by the
// driver, vendor and admin apps (en_route_pickup, PICKING_ITEMS, CREATED, …),
// so enumerating them is what put live orders under "Past". Only a finished
// order is enumerable.

export function useOrders() {
  const { insets, tabBarHeight, tokens, styles, orders, setOrders, loading, refreshing, onRefresh, serviceFilters, setServiceFilters, showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters, reorderingId, setReorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating, reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, setSubmittingReview, withKey, filtered } = useOrdersInsets();
  const { scheduled, active, past, serviceCounts, handleOpenReviewModal, handleSubmitReview, reorderIntoCart } = useOrdersScheduled(orders, setOrders, setReorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating, reviewComment, setReviewComment, reviewTags, setReviewTags, setSubmittingReview, withKey, filtered);
  const { handleReorder } = useOrdersHandleReorder(reorderIntoCart);
  const { openFilterSheet, applyFilters, toggleServiceFilter, pendingCount, isEmpty } = useOrdersOpenFilterSheet(orders, loading, serviceFilters, setServiceFilters, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters, withKey);

  return {
  insets, tabBarHeight, tokens, styles, orders, loading, refreshing, onRefresh, serviceFilters, setServiceFilters,
  showFilterSheet, setShowFilterSheet, pendingServiceFilters, setPendingServiceFilters,
  reorderingId, selectedOrderForReview, setSelectedOrderForReview, reviewRating, setReviewRating,
  reviewComment, setReviewComment, reviewTags, setReviewTags, submittingReview, scheduled, active,
  past, serviceCounts, handleOpenReviewModal, handleSubmitReview, handleReorder, openFilterSheet,
  applyFilters, toggleServiceFilter, pendingCount, isEmpty
  };
}

