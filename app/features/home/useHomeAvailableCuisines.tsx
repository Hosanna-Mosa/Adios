import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { STRIDE } from "./constants";
import { DEFAULT_CUISINES, DEFAULT_MEAT_TYPES } from "./useHome.shared";

export interface PromoCard {
  eyebrow: string;
  headline: string;
  caption: string;
  /** From the source banner; when set, tapping the card opens it instead of /offers. */
  targetUrl?: string;
}

// Split out of useHome so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHomeAvailableCuisines(restaurants: any, meatCenters: any, nearbyDriversCount: any, loadingDrivers: any, activeService: any, banners: any, carouselRef: any, bannerIndexRef: any, hasNoLocation: any, showHomeSkeleton: any, visibleItems: any, bannersLoading = false) {
  const { t } = useTranslation();

  // Pure display copy (not compared against anything), safe to translate
  // directly — unlike DEFAULT_CUISINES/DEFAULT_MEAT_TYPES below, which stay
  // in English since they double as fallback filter-chip values matched
  // against live backend category data (see CuisineStrip.tsx's
  // translateFoodTag() for how those get a translated display instead).
  const FOOD_PROMOS = useMemo<PromoCard[]>(() => [
    { eyebrow: t("app.home.foodPromos.firstOrder.eyebrow"), headline: t("app.home.foodPromos.firstOrder.headline"), caption: t("app.home.foodPromos.firstOrder.caption") },
    { eyebrow: t("app.home.foodPromos.lateNight.eyebrow"), headline: t("app.home.foodPromos.lateNight.headline"), caption: t("app.home.foodPromos.lateNight.caption") },
  ], [t]);
  const MEAT_PROMOS = useMemo<PromoCard[]>(() => [
    { eyebrow: t("app.home.meatPromos.sundaySpecial.eyebrow"), headline: t("app.home.meatPromos.sundaySpecial.headline"), caption: "" },
    { eyebrow: t("app.home.meatPromos.cleanedAndCut.eyebrow"), headline: t("app.home.meatPromos.cleanedAndCut.headline"), caption: "" },
  ], [t]);

  const availableCuisines = useMemo(() => {
    const cuisinesSet = new Set<string>();
    const items = activeService === "Meat" ? meatCenters : restaurants;
    items.forEach((item: any) => {
      if (Array.isArray(item.categories)) item.categories.forEach((cat: string) => cuisinesSet.add(cat));
    });
    return Array.from(cuisinesSet).slice(0, 20);
  }, [restaurants, meatCenters, activeService]);

  const cuisineChips = availableCuisines.length > 0
    ? availableCuisines.slice(0, 8)
    : activeService === "Meat" ? DEFAULT_MEAT_TYPES : DEFAULT_CUISINES;

  // "No riders nearby" replaces the restaurant list, not the whole screen: the
  // address row, service tiles and cuisine strip stay put and the notice renders
  // underneath them, so the customer can still switch service or area.
  const noRidersNearby = !hasNoLocation && !showHomeSkeleton && !loadingDrivers && (nearbyDriversCount ?? 0) === 0;
  const showCategories = !hasNoLocation;

  const heroBanners = useMemo(
    () => banners.filter((b: any) => (!b.itemType || b.itemType === "banner") && (!b.position || b.position === "hero" || b.position === "inline")),
    [banners]
  );
  const greetingAds = useMemo(() => banners.filter((b: any) => b.itemType === "ad" && b.position === "below_greetings"), [banners]);

  // While GET /banners is still in flight the carousel shows a skeleton, so the
  // hardcoded promos only appear once we know there are no hero banners.
  const promoCards: PromoCard[] = heroBanners.length > 0
    ? heroBanners.map((b: any) => ({ eyebrow: t("app.home.offerEyebrow"), headline: b.title, caption: b.description || "", targetUrl: b.targetUrl }))
    : bannersLoading ? [] : activeService === "Meat" ? MEAT_PROMOS : FOOD_PROMOS;

  useEffect(() => {
    if (promoCards.length < 2) return;
    const interval = setInterval(() => {
      let next = bannerIndexRef.current + 1;
      if (promoCards.length === 0) return;
      if (next >= promoCards.length) next = 0;
      carouselRef.current?.scrollTo({ x: next * STRIDE, animated: true });
      bannerIndexRef.current = next;
    }, 4000);
    return () => clearInterval(interval);
  }, [promoCards.length]);

  const scrollY = useSharedValue(0);
  const isStickyVisibleShared = useSharedValue(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  const stickyHeaderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [330, 360], [-120, 0], "clamp") }],
    opacity: interpolate(scrollY.value, [330, 350], [0, 1], "clamp"),
  }));

  return { availableCuisines, cuisineChips, showCategories, noRidersNearby, greetingAds, promoCards, scrollY, isStickyVisibleShared, isStickyVisible, setIsStickyVisible, stickyHeaderAnimatedStyle };
}
