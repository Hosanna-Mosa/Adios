import { useEffect, useState, useMemo } from "react";
import { Linking, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { createStyles } from "./restaurant-details.styles";
import { VendorDetails, VendorOffer } from "./vendor-details.types";

// State, data loading and handlers for app/restaurant-details.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

// Only used to highlight today's row; the authoritative window is openState.today.
// Left untranslated deliberately: `todayName` (derived from this array) is
// compared against `entry.day` in VendorTimingsSection.tsx, which is the
// vendor's own opening-hours data from the backend — real day names in
// English. The rendered row label is `entry.day` itself, not a value from
// this array, so nothing here actually reaches the screen as visible text;
// translating it would only break the same-day comparison.
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useRestaurantDetails() {
  const { id, name: searchName, rating: searchRating, reviews: searchReviews, isMeat } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services[isMeat === "true" ? "meat" : "food"];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, isMeat]);

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [offers, setOffers] = useState<VendorOffer[]>([]);

  useEffect(() => {
    // There's no public by-id endpoint for meat centers today, only for
    // food vendors — skip the doomed fetch for meat and fall back to
    // whatever the previous screen already passed along.
    if (!id || isMeat === "true") {
      setLoading(false);
      return;
    }
    const fetchVendorDetails = async () => {
      try {
        setVendor(await customFetch<VendorDetails>(`/vendors/${id}`));
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, [id, isMeat]);

  // Offers are their own request: /coupons/applicable is authenticated (so it has
  // to go through customFetch, not a bare fetch) and platform-wide coupons apply
  // to meat centers too, which the vendor lookup above skips.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await customFetch<{ coupons: VendorOffer[] }>(`/coupons/applicable?vendorId=${id}&subtotal=0`);
        if (!cancelled) setOffers(Array.isArray(data?.coupons) ? data.coupons : []);
      } catch (error) {
        // An unauthenticated or offline session simply shows no offers.
        console.error("Error fetching offers:", error);
        if (!cancelled) setOffers([]);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error("Failed to call:", err));
  };

  const handleEmail = (emailAddress: string) => {
    Linking.openURL(`mailto:${emailAddress}`).catch((err) => console.error("Failed to email:", err));
  };

  const handleNavigate = () => {
    const targetName = vendor?.name || (searchName as string) || "Restaurant";
    if (vendor?.location?.coordinates && vendor.location.coordinates.length === 2) {
      const [lng, lat] = vendor.location.coordinates;
      const label = encodeURIComponent(targetName);
      const url = Platform.select({
        ios: `maps://app?daddr=${lat},${lng}&q=${label}`,
        android: `google.navigation:q=${lat},${lng}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      });
      Linking.canOpenURL(url).then((supported) => {
        if (supported) Linking.openURL(url);
        else Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      }).catch((err) => console.error("Error launching navigation:", err));
    } else {
      const addressQuery = encodeURIComponent(vendor?.address || targetName);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`).catch((err) =>
        console.error("Failed to open map query:", err)
      );
    }
  };

  const openState = vendor?.openState;
  const isOpenNow = openState ? openState.isOpen : vendor?.isOpen !== false;
  const openLabel = openState?.label || (isOpenNow ? "Open now" : "Closed");
  const todayName = WEEKDAY_NAMES[new Date().getDay()];

  const displayName = vendor?.name || (searchName as string) || "Restaurant";
  const displayRating = vendor?.rating || parseFloat(searchRating as string) || undefined;
  const displayReviews = vendor?.reviews || (searchReviews as string) || undefined;


  return {
  isMeat, insets, tabBarHeight, tokens, accent, styles, loading, vendor, offers, handleCall,
  handleEmail, handleNavigate, openState, isOpenNow, openLabel, todayName, displayName,
  displayRating, displayReviews
  };
}
