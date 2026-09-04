import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RequireAuth, RequireVendor } from "@/components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import LiveOrders from "./pages/LiveOrders";
import Drivers from "./pages/Drivers";
import Analytics from "./pages/Analytics";
import Payments from "./pages/Payments";
import Support from "./pages/Support";
import SupportIssues from "./pages/SupportIssues";
import SupportChat from "./pages/SupportChat";
import OrderDetail from "./pages/OrderDetail";
import Users from "./pages/Users";
import Vendors from "./pages/Vendors";
import RestaurantMenu from "./pages/RestaurantMenu";
import MeatCenters from "./pages/MeatCenters";
import MeatPricing from "./pages/MeatPricing";
import VendorLogin from "./pages/VendorLogin";
import Zones from "./pages/Zones";
import Banners from "./pages/Banners";

import VendorDashboard from "./pages/VendorDashboard";
import VendorScheduledOrders from "./pages/VendorScheduledOrders";
import VendorMenu from "./pages/VendorMenu";
import VendorMeatMenu from "./pages/VendorMeatMenu";
import VendorSettings from "./pages/VendorSettings";
import Coupons from "./pages/Coupons";
import UserDetail from "./pages/UserDetail";
import DriverDetail from "./pages/DriverDetail";
import NotFound from "./pages/NotFound";
import AppVersions from "./pages/AppVersions";
import DevDrivers from "./pages/DevDrivers";

const RootRedirect = () => {
  const adminToken = localStorage.getItem("admin_token");
  const vendorToken = localStorage.getItem("vendor_token");
  const supportToken = localStorage.getItem("support_token");

  if (adminToken) return <Dashboard />;
  if (supportToken) return <Navigate to="/support-cases" replace />;
  if (vendorToken) return <Navigate to="/vendor/dashboard" replace />;
  return <Navigate to="/vendor-login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/vendor-login" element={<VendorLogin />} />

          <Route path="/live-orders" element={<RequireAuth><LiveOrders /></RequireAuth>} />
          <Route path="/live-orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
          <Route path="/drivers" element={<RequireAuth><Drivers /></RequireAuth>} />
          <Route path="/dev-drivers" element={<RequireAuth><DevDrivers /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/payments" element={<RequireAuth><Payments /></RequireAuth>} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
