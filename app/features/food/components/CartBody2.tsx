import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
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
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            {lastVendorName
              ? `Nothing here yet. Your last order was ${lastVendorName}, ${daysAgo === 0 ? "today" : `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`}.`
              : "Nothing here yet — find something to add from a restaurant or meat center."}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.primaryBtnText}>Browse restaurants</Text>
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
              <Text style={styles.secondaryBtnText}>Order from {lastVendorName} again</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentOrders.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentLabel}>Order again</Text>
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
                    onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: vId, name: vName } })}
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
