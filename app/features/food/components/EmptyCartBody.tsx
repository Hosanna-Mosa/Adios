import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { AppTabBar } from "@/components/AppTabBar";
import { CartHeader } from "./CartHeader";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CartStyles } from "@/features/food/cart.styles";
import { selectNoRidersOnline, useHomeStore } from "@/contexts/homeStore";
import { showAlert } from "@/components/ui/AppAlert";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  lastVendorName: string;
  lastOrder: any;
  daysAgo: any;
  accent: ServiceTokens;
  insets: EdgeInsets;
  loadingRecent: any;
  recentOrders: any[];
  serviceKey: any;
  styles: CartStyles;
  tabBarHeight: number;
  tokens: ThemeTokens;
}

export function EmptyCartBody({
  lastVendorName,
  lastOrder,
  daysAgo,
  accent,
  insets,
  loadingRecent,
  recentOrders,
  serviceKey,
  styles,
  tabBarHeight,
  tokens,
}: Props) {
  const { t } = useTranslation();
  const noRidersOnline = useHomeStore(selectNoRidersOnline);

  // Nothing can be delivered with no rider online, so don't open a restaurant
  // just to strand the user there — say why and go back to Home.
  const openRestaurant = (id: string, name: string) => {
    if (noRidersOnline) {
      showAlert(t("app.home.noRidersAvailableNearby"), t("app.home.allCaptainsNearbyAreOnTrips"));
      router.replace("/(tabs)");
      return;
    }
    router.push({ pathname: "/restaurant-menu", params: { id, name } });
  };

  return (
    <>
    <View style={styles.root}>
      <CartHeader
        insets={insets}
        styles={styles}
        tokens={tokens}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-outline" size={moderateScale(30)} color={accent.accent} />
          </View>
          <Text style={styles.emptyTitle}>{t("app.food.yourCartIsEmpty")}</Text>
          <Text style={styles.emptySubtitle}>
            {lastVendorName
              ? (daysAgo === 0
                  ? t("app.food.lastOrderToday", { vendor: lastVendorName })
                  : t("app.food.lastOrderDaysAgo", { vendor: lastVendorName, count: daysAgo }))
              : t("app.food.nothingHereYetFindSomethingTo")}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.primaryBtnText}>{t("app.food.browseRestaurants")}</Text>
          </TouchableOpacity>
          {lastVendorName && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() =>
                openRestaurant(typeof lastOrder.vendor === "object" ? lastOrder.vendor._id : lastOrder.vendor, lastVendorName)
              }
            >
              <Text style={styles.secondaryBtnText}>{t("app.food.orderFrom")} {lastVendorName} {t("app.food.again")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentOrders.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentLabel}>{t("app.food.orderAgain")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {recentOrders.map((o) => {
                const vName = typeof o.vendor === "object" ? o.vendor.name : "Vendor";
                const vId = typeof o.vendor === "object" ? o.vendor._id : o.vendor;
                const vImage = typeof o.vendor === "object" ? o.vendor.image : null;
                return (
                  <TouchableOpacity
                    key={o._id}
                    style={styles.recentCard}
                    activeOpacity={0.85}
                    onPress={() => openRestaurant(vId, vName)}
                  >
                    {vImage ? (
                      <Image source={{ uri: vImage }} style={styles.recentImage} contentFit="cover" transition={200} />
                    ) : (
                      <View style={styles.recentImagePlaceholder}>
                        <Ionicons name="restaurant-outline" size={moderateScale(20)} color={tokens.muted} />
                      </View>
                    )}
                    <Text style={styles.recentName} numberOfLines={1}>{vName}</Text>
                    <Text style={styles.recentMeta}>₹{Math.round(o.totalPrice || 0)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        {loadingRecent && <ActivityIndicator style={{ marginTop: 20 }} color={accent.accent} />}
      </ScrollView>

      <AppTabBar active="cart" accent={serviceKey} />
    </View>
    </>
  );
}
