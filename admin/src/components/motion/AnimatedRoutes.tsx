import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RequireAuth, RequireVendor } from "@/components/RequireAuth";
import { RouteLoadingFallback } from "./RouteLoadingFallback";

// Always needed immediately on cold load — not worth lazy-loading.
import VendorLogin from "@/pages/VendorLogin";
import NotFound from "@/pages/NotFound";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LiveOrders = lazy(() => import("@/pages/LiveOrders"));
const ScheduledOrders = lazy(() => import("@/pages/ScheduledOrders"));
const Drivers = lazy(() => import("@/pages/Drivers"));
const DevDrivers = lazy(() => import("@/pages/DevDrivers"));
const Analytics = lazy(() => import("@/pages/Analytics"));
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
const UserDetail = lazy(() => import("@/pages/UserDetail"));
const DriverDetail = lazy(() => import("@/pages/DriverDetail"));
const AppVersions = lazy(() => import("@/pages/AppVersions"));

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
  if (supportToken) return <Navigate to="/support-cases" replace />;
  if (vendorToken) return <Navigate to="/vendor/dashboard" replace />;
  return <Navigate to="/vendor-login" replace />;
};

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {/* key forces a fresh mount (and thus a fresh PageTransition entrance
          animation) even when navigating between two params of the same
          route, e.g. /users/1 -> /users/2 */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/vendor-login" element={<VendorLogin />} />

        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/live-orders" element={<RequireAuth><LiveOrders /></RequireAuth>} />
        <Route path="/live-orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="/scheduled-orders" element={<RequireAuth><ScheduledOrders /></RequireAuth>} />
        <Route path="/drivers" element={<RequireAuth><Drivers /></RequireAuth>} />
        <Route path="/dev-drivers" element={<RequireAuth><DevDrivers /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/payments" element={<RequireAuth><Payments /></RequireAuth>} />
        <Route path="/refunds" element={<RequireAuth><Refunds /></RequireAuth>} />
        <Route path="/payouts" element={<RequireAuth><Payouts /></RequireAuth>} />
        <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
        <Route path="/support-cases" element={<RequireAuth><SupportIssues /></RequireAuth>} />
        <Route path="/support/chats" element={<RequireAuth><SupportChat /></RequireAuth>} />
        <Route path="/support/chats/:id" element={<RequireAuth><SupportChat /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
        <Route path="/vendors" element={<RequireAuth><Vendors /></RequireAuth>} />
        <Route path="/restaurant-menu" element={<RequireAuth><RestaurantMenu /></RequireAuth>} />
        <Route path="/meat-centers" element={<RequireAuth><MeatCenters /></RequireAuth>} />
        <Route path="/meat-pricing" element={<RequireAuth><MeatPricing /></RequireAuth>} />
        <Route path="/zones" element={<RequireAuth><Zones /></RequireAuth>} />
        <Route path="/banners" element={<RequireAuth><Banners /></RequireAuth>} />

        <Route path="/vendor/dashboard" element={<RequireVendor><VendorDashboard /></RequireVendor>} />
        <Route path="/vendor/scheduled-orders" element={<RequireVendor><VendorScheduledOrders /></RequireVendor>} />
        <Route path="/vendor/menu" element={<RequireVendor><VendorMenu /></RequireVendor>} />
        <Route path="/vendor/meat-menu" element={<RequireVendor><VendorMeatMenu /></RequireVendor>} />
        <Route path="/vendor/settings" element={<RequireVendor><VendorSettings /></RequireVendor>} />
        <Route path="/coupons" element={<RequireAuth><Coupons /></RequireAuth>} />
        <Route path="/users/:id" element={<RequireAuth><UserDetail /></RequireAuth>} />
        <Route path="/drivers/:id" element={<RequireAuth><DriverDetail /></RequireAuth>} />
        <Route path="/app-updates" element={<RequireAuth><AppVersions /></RequireAuth>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
