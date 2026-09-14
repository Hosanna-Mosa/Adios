import { OrdersFilterSheet } from "@/features/orders/components/OrdersFilterSheet";
import { OrderReviewSheet } from "@/features/orders/components/OrderReviewSheet";

// Markup moved out of (tabs)/orders.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  tokens: any;
  styles: any;
  orders: any;
  showFilterSheet: any;
  setShowFilterSheet: any;
  pendingServiceFilters: any;
  setPendingServiceFilters: any;
  selectedOrderForReview: any;
  setSelectedOrderForReview: any;
  reviewRating: any;
  setReviewRating: any;
  reviewComment: any;
  setReviewComment: any;
  reviewTags: any;
  setReviewTags: any;
  submittingReview: any;
  serviceCounts: any;
  handleSubmitReview: any;
  applyFilters: any;
  toggleServiceFilter: any;
  pendingCount: any;
  SERVICE_META: any;
  REVIEW_TAGS: any;
}

export function OrdersSection5({
  tokens,
  styles,
  orders,
  showFilterSheet,
  setShowFilterSheet,
  pendingServiceFilters,
  setPendingServiceFilters,
  selectedOrderForReview,
  setSelectedOrderForReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewTags,
  setReviewTags,
  submittingReview,
  serviceCounts,
  handleSubmitReview,
  applyFilters,
  toggleServiceFilter,
  pendingCount,
  SERVICE_META,
  REVIEW_TAGS,
}: Props) {
  return (
    <>
    <OrdersFilterSheet
      applyFilters={applyFilters}
      orders={orders}
      pendingCount={pendingCount}
      pendingServiceFilters={pendingServiceFilters}
      serviceCounts={serviceCounts}
      setPendingServiceFilters={setPendingServiceFilters}
      setShowFilterSheet={setShowFilterSheet}
      showFilterSheet={showFilterSheet}
      styles={styles}
      toggleServiceFilter={toggleServiceFilter}
      tokens={tokens}
    />

    {/* Review modal */}
    <OrderReviewSheet
      REVIEW_TAGS={REVIEW_TAGS}
      handleSubmitReview={handleSubmitReview}
      reviewComment={reviewComment}
      reviewRating={reviewRating}
      reviewTags={reviewTags}
      selectedOrderForReview={selectedOrderForReview}
      setReviewComment={setReviewComment}
      setReviewRating={setReviewRating}
      setReviewTags={setReviewTags}
      setSelectedOrderForReview={setSelectedOrderForReview}
      styles={styles}
      submittingReview={submittingReview}
      tokens={tokens}
    />
    </>
  );
}
