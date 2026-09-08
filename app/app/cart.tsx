import React, { useEffect, useMemo, useState } from "react";
import { CartBody } from "@/features/food/components/CartBody";
import { Alert } from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStyles } from "@/features/food/cart.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useHomeStore, useServiceAccent } from "@/contexts/homeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";
import { CartFooter } from "@/features/food/components/CartFooter";
import { CartHeader } from "@/features/food/components/CartHeader";

import { CartHeader3 } from "@/features/food/components/CartHeader3";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { CartBody2 } from "@/features/food/components/CartBody2";
import { CartRestoringState } from "@/features/food/components/CartRestoringState";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const { vendorName: paramVendorName } = useLocalSearchParams();
  const { items, getTotalPrice, vendorId, updateQuantity, addItem, clearCart } = useCartStore();
  const storeVendorName = useCartStore((s) => s.vendorName);
  const cartStatus = useCartStore((s) => s.status);
  const syncNotices = useCartStore((s) => s.syncNotices);
  const clearSyncNotices = useCartStore((s) => s.clearSyncNotices);

  // The active Food/Meat mode is the single source of truth for the accent, so
  // the cart tints to whatever the customer is actually shopping.
  const activeService = useHomeStore((s) => s.activeService);
  const serviceKey = activeService === "Meat" ? "meat" : "food";
  const accent = useServiceAccent();
  const styles = useMemo(() => createStyles(tokens, accent), [theme, accent]);

  const [fetchedVendorName, setFetchedVendorName] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    // Only food vendors expose a public by-id lookup today — meat centers
    // don't, so their delivery fee genuinely can't be sourced here yet.
    customFetch<any>(`/vendors/${vendorId}`)
      .then((v) => {
        if (v?.name) setFetchedVendorName(v.name);
        if (typeof v?.deliveryFee === "number") setDeliveryFee(v.deliveryFee);
      })
      .catch(() => {});
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    customFetch<any[]>(`/food/vendor/${vendorId}`)
      .then((data) => {
        if (data?.length) setMenuItems(data);
        else fetchMeatMenu();
      })
      .catch(fetchMeatMenu);

    function fetchMeatMenu() {
      customFetch<any[]>(`/meat/menu/${vendorId}`)
        .then((meatData) => {
          if (Array.isArray(meatData)) {
            setMenuItems(
              meatData.map((item: any) => ({
                ...item,
                isVeg: false,
                images: item.images || [item.image || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400"],
                description: item.description || `Fresh ${item.name} - ${item.weight}`,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [vendorId]);

  // Empty-cart "order again" — real order history, best-effort vendor name.
  useEffect(() => {
    if (items.length > 0) return;
    setLoadingRecent(true);
    customFetch<any[]>("/orders")
      .then((orders) => {
        const withVendor = (orders || []).filter((o) => o.vendor);
        const seen = new Set<string>();
        const deduped = withVendor.filter((o) => {
          const vId = typeof o.vendor === "object" ? o.vendor._id : o.vendor;
          if (seen.has(vId)) return false;
          seen.add(vId);
          return true;
        });
        setRecentOrders(deduped.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [items.length]);

  const complements = useMemo(
    () => menuItems.filter((m) => !items.some((c) => c._id === m._id)),
    [menuItems, items]
  );

  const displayVendorName = paramVendorName
    ? String(paramVendorName)
    : storeVendorName || fetchedVendorName || "your vendor";
  const subtotal = getTotalPrice();

  // The server owns the coupon maths — this is only what it told us.
  const discount = appliedPromo?.discountAmount || 0;
  const total = Math.max(0, Math.round((subtotal + (deliveryFee || 0) - discount) * 100) / 100);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const response = await customFetch<{ valid: boolean; code: string; discountAmount: number }>(
        "/coupons/validate",
        {
          method: "POST",
          body: JSON.stringify({ code: promoCode.trim().toUpperCase(), vendorId, subtotal }),
        }
      );
      if (response?.code) {
        setAppliedPromo({ code: response.code, discountAmount: Number(response.discountAmount) || 0 });
        setShowPromoInput(false);
        setPromoCode("");
      }
    } catch (error: any) {
      setPromoError((error?.message || "Invalid promo code").replace(/^HTTP \d+.*?: /, "").trim());
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Quantities change after a code is applied, so the saving has to be re-derived
  // server-side rather than left showing a number the order would be rejected for.
  useEffect(() => {
    const code = appliedPromo?.code;
    if (!code) return;
    let cancelled = false;
    customFetch<{ code: string; discountAmount: number }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, vendorId, subtotal }),
    })
      .then((res) => {
        if (cancelled || !res?.code) return;
        setAppliedPromo({ code: res.code, discountAmount: Number(res.discountAmount) || 0 });
      })
      .catch((error: any) => {
        if (cancelled) return;
        setAppliedPromo(null);
        setPromoError((error?.message || "This promo code no longer applies").replace(/^HTTP \d+.*?: /, "").trim());
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const confirmClearCart = () => {
    Alert.alert("Clear cart?", `This removes every item from ${displayVendorName}.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear cart", style: "destructive", onPress: () => clearCart() },
    ]);
  };

  const goToCheckout = () => {
    router.push({
      pathname: "/checkout",
      params: {
        subtotal: String(subtotal),
        deliveryFee: deliveryFee != null ? String(deliveryFee) : "",
        discount: String(discount),
        couponCode: appliedPromo?.code || "",
        total: String(total),
        vendorName: displayVendorName,
      },
    });
  };

  // Restoring this account's saved cart — showing the empty state here would
  // read as "your cart was thrown away" for the second it takes.
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
        <AppTabBar active="cart" accent={serviceKey} />
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
