import { View, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { AppTabBar } from "@/components/AppTabBar";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { VendorIdentityCard } from "@/features/food/components/VendorIdentityCard";
import { VendorOffersSection } from "@/features/food/components/VendorOffersSection";
import { VendorTimingsSection } from "@/features/food/components/VendorTimingsSection";
import { VendorHygieneSection } from "@/features/food/components/VendorHygieneSection";
import { VendorAddressSection } from "@/features/food/components/VendorAddressSection";
import { VendorContactRow } from "@/features/food/components/VendorContactRow";
import { MeatDetailsNotice } from "@/features/food/components/MeatDetailsNotice";
import { useRestaurantDetails } from "@/features/food/useRestaurantDetails";

export default function RestaurantDetails() {
  const {
  isMeat, insets, tabBarHeight, tokens, accent, styles, loading, vendor, offers, handleCall,
  handleEmail, handleNavigate, openState, isOpenNow, openLabel, todayName, displayName,
  displayRating, displayReviews
  } = useRestaurantDetails();

  return (
    <ScreenShell>
      <Header
        title={isMeat === "true" ? "Meat center info" : "Restaurant info"}
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={accent.accent} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
          <VendorIdentityCard
            vendor={vendor}
            displayName={displayName}
            displayRating={displayRating}
            displayReviews={displayReviews}
            isOpenNow={isOpenNow}
            openLabel={openLabel}
            tokens={tokens}
            styles={styles}
          />

          <View style={styles.divider} />

          <VendorOffersSection offers={offers} styles={styles} />

          <VendorTimingsSection
            openState={openState}
            isOpenNow={isOpenNow}
            todayName={todayName}
            styles={styles}
          />

          <VendorHygieneSection
            fssaiNumber={vendor?.legal?.fssaiNumber}
            tokens={tokens}
            styles={styles}
          />

          <VendorAddressSection vendor={vendor} onNavigate={handleNavigate} styles={styles} />

          <VendorContactRow
            vendor={vendor}
            onCall={handleCall}
            onEmail={handleEmail}
            tokens={tokens}
            styles={styles}
          />

          {isMeat === "true" && !vendor && <MeatDetailsNotice styles={styles} />}
        </ScrollView>
      )}

      <AppTabBar accent={isMeat === "true" ? "meat" : "food"} cartVendorName={displayName} />
    </ScreenShell>
  );
}
