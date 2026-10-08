import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RequireAdmin, RequireAuth, RequireVendor } from "@/components/RequireAuth";
import { RouteLoadingFallback } from "./RouteLoadingFallback";
import { usePageViews } from "@/lib/analytics";
import { SUPPORT_HOME } from "@/lib/session";

// Always needed immediately on cold load — not worth lazy-loading.
import VendorLogin from "@/pages/VendorLogin";
import NotFound from "@/pages/NotFound";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LiveOrders = lazy(() => import("@/pages/LiveOrders"));
const ScheduledOrders = lazy(() => import("@/pages/ScheduledOrders"));
const Drivers = lazy(() => import("@/pages/Drivers"));
// Dev-only page (seeds fake drivers): not even bundled into production builds.
const DevDrivers = import.meta.env.DEV ? lazy(() => import("@/pages/DevDrivers")) : null;
const Analytics = lazy(() => import("@/pages/Analytics"));
const LiveActivity = lazy(() => import("@/pages/LiveActivity"));
const Payments = lazy(() => import("@/pages/Payments"));
const Refunds = lazy(() => import("@/pages/Refunds"));
const Payouts = lazy(() => import("@/pages/Payouts"));
const Support = lazy(() => import("@/pages/Support"));
const SupportIssues = lazy(() => import("@/pages/SupportIssues"));
const SupportChat = lazy(() => import("@/pages/SupportChat"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const Users = lazy(() => import("@/pages/Users"));
const Vendors = lazy(() => import("@/pages/Vendors"));
const RestaurantMenu = lazy(() => import("@/pages/RestaurantMenu"));
const MeatCenters = lazy(() => import("@/pages/MeatCenters"));
const MeatPricing = lazy(() => import("@/pages/MeatPricing"));
const Zones = lazy(() => import("@/pages/Zones"));
const Banners = lazy(() => import("@/pages/Banners"));
const Coupons = lazy(() => import("@/pages/Coupons"));
const Offers = lazy(() => import("@/pages/Offers"));
const UserDetail = lazy(() => import("@/pages/UserDetail"));
const DriverDetail = lazy(() => import("@/pages/DriverDetail"));
const AppVersions = lazy(() => import("@/pages/AppVersions"));
const HelperPricing = lazy(() => import("@/pages/HelperPricing"));
const DriverVerification = lazy(() => import("@/pages/DriverVerification"));
const RestaurantVerification = lazy(() => import("@/pages/RestaurantVerification"));

const VendorDashboard = lazy(() => import("@/pages/VendorDashboard"));
const VendorScheduledOrders = lazy(() => import("@/pages/VendorScheduledOrders"));
const VendorMenu = lazy(() => import("@/pages/VendorMenu"));
const VendorMeatMenu = lazy(() => import("@/pages/VendorMeatMenu"));
const VendorSettings = lazy(() => import("@/pages/VendorSettings"));

const RootRedirect = () => {
  const adminToken = localStorage.getItem("admin_token");
  const vendorToken = localStorage.getItem("vendor_token");
  const supportToken = localStorage.getItem("support_token");

  if (adminToken) return <Navigate to="/dashboard" replace />;
  if (supportToken) return <Navigate to={SUPPORT_HOME} replace />;
  if (vendorToken) return <Navigate to="/vendor/dashboard" replace />;
  return <Navigate to="/vendor-login" replace />;
};

export function AnimatedRoutes() {
  const location = useLocation();
  usePageViews();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {/* key forces a fresh mount (and thus a fresh PageTransition entrance
          animation) even when navigating between two params of the same
          route, e.g. /users/1 -> /users/2 */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/vendor-login" element={<VendorLogin />} />

        <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/live-orders" element={<RequireAdmin><LiveOrders /></RequireAdmin>} />
        <Route path="/live-orders/:id" element={<RequireAdmin><OrderDetail /></RequireAdmin>} />
        <Route path="/scheduled-orders" element={<RequireAdmin><ScheduledOrders /></RequireAdmin>} />
        <Route path="/drivers" element={<RequireAdmin><Drivers /></RequireAdmin>} />
        <Route path="/driver-verification" element={<RequireAdmin><DriverVerification /></RequireAdmin>} />
        <Route path="/restaurant-verification" element={<RequireAdmin><RestaurantVerification /></RequireAdmin>} />
        {/* Dev-only: the page seeds fake drivers, so production builds don't route to it. */}
        {DevDrivers && <Route path="/dev-drivers" element={<RequireAdmin><DevDrivers /></RequireAdmin>} />}
        <Route path="/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
        <Route path="/live-activity" element={<RequireAdmin><LiveActivity /></RequireAdmin>} />
        <Route path="/payments" element={<RequireAdmin><Payments /></RequireAdmin>} />
        <Route path="/refunds" element={<RequireAdmin><Refunds /></RequireAdmin>} />
        <Route path="/payouts" element={<RequireAdmin><Payouts /></RequireAdmin>} />
        <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
        <Route path="/support-cases" element={<RequireAuth><SupportIssues /></RequireAuth>} />
        <Route path="/support/chats" element={<RequireAuth><SupportChat /></RequireAuth>} />
        <Route path="/support/chats/:id" element={<RequireAuth><SupportChat /></RequireAuth>} />
        <Route path="/users" element={<RequireAdmin><Users /></RequireAdmin>} />
        <Route path="/vendors" element={<RequireAdmin><Vendors /></RequireAdmin>} />
        <Route path="/restaurant-menu" element={<RequireAdmin><RestaurantMenu /></RequireAdmin>} />
        <Route path="/meat-centers" element={<RequireAdmin><MeatCenters /></RequireAdmin>} />
        <Route path="/meat-pricing" element={<RequireAdmin><MeatPricing /></RequireAdmin>} />
        <Route path="/zones" element={<RequireAdmin><Zones /></RequireAdmin>} />
        <Route path="/banners" element={<RequireAdmin><Banners /></RequireAdmin>} />

        <Route path="/vendor/dashboard" element={<RequireVendor><VendorDashboard /></RequireVendor>} />
        <Route path="/vendor/scheduled-orders" element={<RequireVendor><VendorScheduledOrders /></RequireVendor>} />
        <Route path="/vendor/menu" element={<RequireVendor><VendorMenu /></RequireVendor>} />
        <Route path="/vendor/meat-menu" element={<RequireVendor><VendorMeatMenu /></RequireVendor>} />
        <Route path="/vendor/settings" element={<RequireVendor><VendorSettings /></RequireVendor>} />
        <Route path="/coupons" element={<RequireAdmin><Coupons /></RequireAdmin>} />
        <Route path="/offers" element={<RequireAdmin><Offers /></RequireAdmin>} />
        <Route path="/users/:id" element={<RequireAdmin><UserDetail /></RequireAdmin>} />
        <Route path="/drivers/:id" element={<RequireAdmin><DriverDetail /></RequireAdmin>} />
        <Route path="/app-updates" element={<RequireAdmin><AppVersions /></RequireAdmin>} />
        <Route path="/helper-pricing" element={<RequireAdmin><HelperPricing /></RequireAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
