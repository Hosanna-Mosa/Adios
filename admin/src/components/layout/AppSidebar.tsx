import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { staggerContainer, fadeInUp } from "@/components/motion/variants";
import {
  LayoutDashboard,
  ShoppingCart,
  CalendarClock,
  Truck,
  Users,
  GitBranch,
  CreditCard,
  BarChart3,
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
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Live Orders", url: "/live-orders", icon: ShoppingCart },
  { title: "Scheduled Orders", url: "/scheduled-orders", icon: CalendarClock },
  { title: "Drivers", url: "/drivers", icon: Truck },
  { title: "Dev Drivers", url: "/dev-drivers", icon: SlidersHorizontal },
  { title: "Users", url: "/users", icon: Users },
  { title: "Vendors", url: "/vendors", icon: Store },
  { title: "Restaurant Menu", url: "/restaurant-menu", icon: Store },
  { title: "Meat Centers", url: "/meat-centers", icon: Drumstick },
  { title: "Meat Pricing", url: "/meat-pricing", icon: IndianRupee },
  { title: "Zones", url: "/zones", icon: Map },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Support", url: "/support", icon: Headphones },
  { title: "Support Cases", url: "/support-cases", icon: Headphones },
  { title: "Coupons", url: "/coupons", icon: Ticket },
  { title: "App Updates", url: "/app-updates", icon: RefreshCw },
  { title: "Banners", url: "/banners", icon: Image },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Real count for the Live Orders badge below, replacing a literal "24" that
  // never moved regardless of how many orders were actually active. Shares the
  // same query key Drivers.tsx and LiveOrders.tsx already use for /admin/orders,
  // so this doesn't add a request — it just reads their cached result. Gated to
  // admin sessions: this is an ADMIN-only endpoint, and a support session (the
  // only other role this sidebar renders for) never shows this item anyway.
  const isAdminSession = typeof window !== "undefined" && !!localStorage.getItem("admin_token");
  const { data: sidebarOrders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<any[]>("/admin/orders"),
    enabled: isAdminSession,
  });
  const liveOrdersCount = sidebarOrders.filter((o: any) =>
    ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(o.status)
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    localStorage.removeItem("vendor_token");
    localStorage.removeItem("vendor_data");
    localStorage.removeItem("support_token");
    localStorage.removeItem("support_data");
    navigate("/vendor-login");
  };
  return (
    <aside className="w-[240px] h-screen bg-card border-r border-border flex flex-col justify-between shrink-0 sticky top-0 overflow-y-auto">
      <div>
        <div className="px-6 py-6">
          <h1 className="text-xl font-extrabold text-[#00665c] tracking-wide">FLAVOUR</h1>
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold mt-0.5">
            FOOD & SERVICES
          </p>
        </div>

        <motion.nav
          className="mt-2 flex flex-col gap-0.5"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {(() => {
            const isSupport = !!localStorage.getItem("support_token");
            const filteredNavItems = isSupport
              ? navItems.filter(item => item.url === "/support-cases")
              : navItems;

            return filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.url);
            return (
              <motion.div key={item.title} variants={fadeInUp}>
                <Link
                  to={item.url}
                  className={`flex items-center justify-between pl-6 pr-4 py-2.5 text-sm transition-colors rounded-r-full mr-4 ${
                    isActive
                      ? "bg-[#e6f4f2] text-[#00665c] font-bold"
                      : "text-sidebar-foreground hover:bg-muted/50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-[#00665c]" : "text-muted-foreground"}`} />
                    <span>{item.title}</span>
                  </div>
                  {item.title === "Live Orders" && liveOrdersCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#eefcfb] text-[#00665c] px-2 py-0.5 rounded-full border border-[#00665c]/10">
                      {liveOrdersCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })
        })()}
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
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
