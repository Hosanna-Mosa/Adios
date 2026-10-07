import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { LiveOrder } from "@/features/orders/liveOrdersTypes";
import type { VerificationQueueResponse } from "@/features/verification/types";
import { staggerContainer, fadeInUp } from "@/components/motion/variants";
import { clearSession, getStaffRole } from "@/lib/session";
import { socketService } from "@/lib/socketService";
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarClock,
  Truck,
  Users,
  GitBranch,
  CreditCard,
  Undo2,
  Banknote,
  BarChart3,
  Activity,
  Headphones,
  Settings,
  Store,
  Drumstick,
  LogOut,
  IndianRupee,
  Map,
  Ticket,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  ChevronDown,
  Image,
  MessageSquare,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

// The only pages a support session can open (see RequireAdmin in RequireAuth.tsx).
const SUPPORT_NAV_URLS = new Set(["/support", "/support-cases", "/support/chats"]);

function getNavItems(t: (key: string) => string) {
  return [
    { title: t("sidebar.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.liveOrders"), url: "/live-orders", icon: ShoppingCart },
    { title: t("sidebar.scheduledOrders"), url: "/scheduled-orders", icon: CalendarClock },
    { title: t("sidebar.drivers"), url: "/drivers", icon: Truck },
    { title: t("sidebar.driverVerification"), url: "/driver-verification", icon: ShieldCheck },
    // Seeds fake check1..check10 drivers: a local-development tool only, never
    // offered in a production build.
    ...(import.meta.env.DEV ? [{ title: t("sidebar.devDrivers"), url: "/dev-drivers", icon: SlidersHorizontal }] : []),
    { title: t("sidebar.users"), url: "/users", icon: Users },
    { title: t("sidebar.vendors"), url: "/vendors", icon: Store },
    { title: t("sidebar.restaurantVerification"), url: "/restaurant-verification", icon: BadgeCheck },
    { title: t("sidebar.restaurantMenu"), url: "/restaurant-menu", icon: Store },
    { title: t("sidebar.meatCenters"), url: "/meat-centers", icon: Drumstick },
    { title: t("sidebar.meatPricing"), url: "/meat-pricing", icon: IndianRupee },
    { title: t("sidebar.zones"), url: "/zones", icon: Map },
    { title: t("sidebar.payments"), url: "/payments", icon: CreditCard },
    { title: t("sidebar.analytics"), url: "/analytics", icon: BarChart3 },
    { title: t("sidebar.support"), url: "/support", icon: Headphones },
    { title: t("sidebar.supportCases"), url: "/support-cases", icon: Headphones },
    { title: t("sidebar.activeChats"), url: "/support/chats", icon: MessageSquare },
    { title: t("sidebar.coupons"), url: "/coupons", icon: Ticket },
    { title: t("sidebar.appUpdates"), url: "/app-updates", icon: RefreshCw },
    { title: t("sidebar.banners"), url: "/banners", icon: Image },
  ];
}

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(t);

  const isSupport = getStaffRole() === "support";
  const visibleNavItems = isSupport ? navItems.filter((item) => SUPPORT_NAV_URLS.has(item.url)) : navItems;

  // Real count for the Live Orders badge below, replacing a literal "24" that
  // never moved regardless of how many orders were actually active. Shares the
  // same query key Drivers.tsx and LiveOrders.tsx already use for /admin/orders,
  // so this doesn't add a request — it just reads their cached result. Gated to
  // admin sessions: this is an ADMIN-only endpoint, and a support session (the
  // only other role this sidebar renders for) never shows this item anyway.
  const isAdminSession = getStaffRole() === "admin";
  const { data: sidebarOrders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<LiveOrder[]>("/admin/orders"),
    enabled: isAdminSession,
  });
  const liveOrdersCount = sidebarOrders.filter((o) =>
    ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(o.status)
  ).length;

  // Applications waiting for review. Same query keys as the verification pages'
  // default tab, so opening a page reuses this result.
  const { data: driverQueue } = useQuery({
    queryKey: ["verifications", "drivers", "pending_approval"],
    queryFn: () => adminFetch<VerificationQueueResponse>("/admin/verifications/drivers?status=pending_approval"),
    enabled: isAdminSession,
  });
  const { data: vendorQueue } = useQuery({
    queryKey: ["verifications", "vendors", "submitted"],
    queryFn: () => adminFetch<VerificationQueueResponse>("/admin/verifications/vendors?status=submitted"),
    enabled: isAdminSession,
  });
  const badgeCounts: Record<string, number> = {
    "/live-orders": liveOrdersCount,
    "/driver-verification": driverQueue?.counts.pending_approval || 0,
    "/restaurant-verification": vendorQueue?.counts.submitted || 0,
  };

  const handleLogout = () => {
    clearSession();
    // The socket authenticated with this session's token; drop it so the next
    // sign-in (possibly a different role) connects with its own.
    socketService.disconnect();
    navigate("/vendor-login");
  };
  return (
    <aside className="w-[240px] h-screen bg-card border-r border-border flex flex-col justify-between shrink-0 sticky top-0 overflow-y-auto">
      <div>
        <div className="px-6 py-6">
          <h1 className="text-xl font-extrabold text-brand-teal tracking-wide">ADIOS</h1>
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold mt-0.5">
            {t("sidebar.foodAndServices")}
          </p>
          {isSupport && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-teal-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
              <Headphones className="h-3 w-3" />
              {t("panelAuth.supportDesk", "Support desk")}
            </span>
          )}
        </div>

        <motion.nav
          className="mt-2 flex flex-col gap-0.5"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.url);
            return (
              <motion.div key={item.url} variants={fadeInUp}>
                <Link
                  to={item.url}
                  className={`flex items-center justify-between pl-6 pr-4 py-2.5 text-sm transition-colors rounded-r-full mr-4 ${
                    isActive
                      ? "bg-brand-teal-soft text-brand-teal font-bold"
                      : "text-sidebar-foreground hover:bg-muted/50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-brand-teal" : "text-muted-foreground"}`} />
                    <span>{item.title}</span>
                  </div>
                  {badgeCounts[item.url] > 0 && (
                    <span className="text-[10px] font-bold bg-brand-teal-tint text-brand-teal px-2 py-0.5 rounded-full border border-brand-teal/10">
                      {badgeCounts[item.url]}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </div>

      <div className="space-y-4 pb-4">
        {/* Logout Button */}
        <div className="px-6 pt-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>{t("sidebar.signOut")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
