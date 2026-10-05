import { Tabs } from "expo-router";
import { PartnerTabBar } from "@/components/PartnerTabBar";
import { useIsMeatPartner } from "@/contexts/authStore";

// Restaurants get the Menu tab and meat centres the Inventory tab — the same
// split as the web panel's /vendor/menu and /vendor/meat-menu. `href: null`
// hides the tab that doesn't apply to this outlet.
export default function TabLayout() {
  const isMeat = useIsMeatPartner();
  return (
    <Tabs tabBar={(props) => <PartnerTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="menu" options={{ href: isMeat ? null : undefined }} />
      <Tabs.Screen name="inventory" options={{ href: isMeat ? undefined : null }} />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
