import { CartBody } from "@/features/food/components/CartBody";
import { AppTabBar } from "@/components/AppTabBar";
import { CartFooter } from "@/features/food/components/CartFooter";
import { CartHeader } from "@/features/food/components/CartHeader";
import { CartHeader3 } from "@/features/food/components/CartHeader3";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { CartBody2 } from "@/features/food/components/CartBody2";
import { CartRestoringState } from "@/features/food/components/CartRestoringState";
import { useCart } from "@/features/food/useCart";

export default function CartScreen() {
  const {
  insets, tabBarHeight, tokens, items, vendorId, updateQuantity, addItem, cartStatus, syncNotices,
  clearSyncNotices, serviceKey, accent, styles, deliveryFee, recentOrders, loadingRecent,
  showPromoInput, setShowPromoInput, promoCode, setPromoCode, appliedPromo, setAppliedPromo,
  isApplyingPromo, promoError, complements, displayVendorName, subtotal, discount, total,
  handleApplyPromo, confirmClearCart, goToCheckout
  } = useCart();

  if (items.length === 0 && cartStatus === "hydrating") {
    return (
      <ScreenShell>
        <CartHeader
          insets={insets}
          styles={styles}
          tokens={tokens}
        />
        <CartRestoringState
          accent={accent}
          styles={styles}
        />
        <AppTabBar active="cart" accent={serviceKey as "food" | "meat" | "ride" | "task" | "delivery"} />
      </ScreenShell>
    );
  }

  if (items.length === 0) {
    const lastOrder = recentOrders[0];
    const lastVendorName = lastOrder && typeof lastOrder.vendor === "object" ? lastOrder.vendor.name : null;
    const daysAgo = lastOrder ? Math.max(0, Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / 86400000)) : null;

    return (
      <CartBody2
        daysAgo={daysAgo}
        lastOrder={lastOrder}
        lastVendorName={lastVendorName}
        accent={accent}
        insets={insets}
        loadingRecent={loadingRecent}
        recentOrders={recentOrders}
        serviceKey={serviceKey}
        styles={styles}
        tabBarHeight={tabBarHeight}
        tokens={tokens}
      />
    );
  }

  return (
    <ScreenShell>
      <CartHeader3
        confirmClearCart={confirmClearCart}
        displayVendorName={displayVendorName}
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <CartBody
        accent={accent}
        addItem={addItem}
        appliedPromo={appliedPromo}
        clearSyncNotices={clearSyncNotices}
        complements={complements}
        deliveryFee={deliveryFee}
        discount={discount}
        handleApplyPromo={handleApplyPromo}
        insets={insets}
        isApplyingPromo={isApplyingPromo}
        items={items}
        promoCode={promoCode}
        promoError={promoError}
        setAppliedPromo={setAppliedPromo}
        setPromoCode={setPromoCode}
        setShowPromoInput={setShowPromoInput}
        showPromoInput={showPromoInput}
        styles={styles}
        subtotal={subtotal}
        syncNotices={syncNotices}
        tokens={tokens}
        total={total}
        updateQuantity={updateQuantity}
        vendorId={vendorId}
      />

      <CartFooter
        goToCheckout={goToCheckout}
        insets={insets}
        styles={styles}
        total={total}
      />
    </ScreenShell>
  );
}
