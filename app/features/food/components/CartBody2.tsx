import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { AppTabBar } from "@/components/AppTabBar";
import { CartHeader2 } from "./CartHeader2";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  lastVendorName: any;
  lastOrder: any;
  daysAgo: any;
  accent: any;
  insets: any;
  loadingRecent: any;
  recentOrders: any[];
  serviceKey: any;
  styles: any;
  tabBarHeight: any;
  tokens: any;
}

export function CartBody2({
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
  return (
    <>
    <View style={styles.root}>
      <CartHeader2
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
                router.push({
                  pathname: "/restaurant-menu",
                  params: { id: typeof lastOrder.vendor === "object" ? lastOrder.vendor._id : lastOrder.vendor, name: lastVendorName },
                })
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
                return (
                  <TouchableOpacity
                    key={o._id}
                    style={styles.recentCard}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: vId, name: vName } })}
                  >
                    <View style={styles.recentImagePlaceholder} />
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
