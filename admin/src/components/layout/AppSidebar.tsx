import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  MessageSquare,
  Image,
} from "lucide-react";

function getNavItems(t: (key: string) => string) {
  return [
    { title: t("sidebar.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("sidebar.liveOrders"), url: "/live-orders", icon: ShoppingCart },
    { title: t("sidebar.scheduledOrders"), url: "/scheduled-orders", icon: CalendarClock },
    { title: t("sidebar.drivers"), url: "/drivers", icon: Truck },
    { title: t("sidebar.devDrivers"), url: "/dev-drivers", icon: SlidersHorizontal },
    { title: t("sidebar.users"), url: "/users", icon: Users },
    { title: t("sidebar.vendors"), url: "/vendors", icon: Store },
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
          <h1 className="text-xl font-extrabold text-brand-teal tracking-wide">FLAVOUR</h1>
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-bold mt-0.5">
            {t("sidebar.foodAndServices")}
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
              ? navItems.filter(item => item.url === "/support-cases" || item.url === "/support/chats")
              : navItems;

            return filteredNavItems.map((item) => {
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
                  {item.url === "/live-orders" && (
                    <span className="text-[10px] font-bold bg-brand-teal-tint text-brand-teal px-2 py-0.5 rounded-full border border-brand-teal/10">
                      24
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
        {/* Need Help? Box */}
        <div className="mx-4 p-4 rounded-2xl bg-[#f8fafc] border border-border flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-muted-foreground shrink-0 border border-border shadow-sm">
              <Headphones className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">{t("sidebar.needHelp")}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{t("sidebar.contactSupportForAssistance")}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/support")}
            className="w-full py-2 border border-border bg-white text-xs font-semibold rounded-xl text-foreground hover:bg-muted/50 transition-colors shadow-sm"
          >
            {t("sidebar.contactSupport")}
          </button>
        </div>

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
