import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  LogOut,
  Drumstick,
  CalendarClock
} from "lucide-react";
import { TopBar } from "./TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { socketService } from "@/lib/socketService";
import { playNewOrderChime } from "@/lib/notificationSound";

interface VendorLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
}

const navItems = [
  { title: "Dashboard", url: "/vendor/dashboard", icon: LayoutDashboard },
  { title: "Scheduled Orders", url: "/vendor/scheduled-orders", icon: CalendarClock },
  { title: "Menu Items", url: "/vendor/menu", icon: UtensilsCrossed },
  { title: "Settings", url: "/vendor/settings", icon: Settings },
];

export function VendorLayout({ children, searchPlaceholder }: VendorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("vendor_sidebar_open");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Mounted for every /vendor/* page (this layout wraps all of them), not just
  // the dashboard — a new-order alert that only fired while the vendor happened
  // to be looking at the dashboard would miss every order that arrived while
  // they were on Menu, Settings, or Scheduled Orders instead, which is exactly
  // the situation this sound exists to cover.
  useEffect(() => {
    if (!vendorData._id) return;

    socketService.connect();
    socketService.join(vendorData._id, "VENDOR");

    const handleNewOrder = (data: { id?: string }) => {
      console.log("[SOCKET] New order received:", data);
      playNewOrderChime();
      toast.success(
        t("vendorDashboard.newOrderReceived", {
          id: data.id?.startsWith("ORD-") ? data.id : `#${String(data.id || "").slice(-6).toUpperCase()}`,
          defaultValue: "New order received! Order {{id}}",
        }),
        { duration: 8000 },
      );
      queryClient.invalidateQueries({ queryKey: ["vendor-orders", vendorData._id] });
    };

    socketService.on("new_order_vendor", handleNewOrder);
    return () => socketService.off("new_order_vendor", handleNewOrder);
  }, [vendorData._id, queryClient, t]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("vendor_sidebar_open", JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor_token");
    localStorage.removeItem("vendor_data");
    navigate("/vendor-login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <motion.div
        animate={{ width: isSidebarOpen ? 240 : 0 }}
        transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden flex shrink-0 sticky top-0 h-screen"
      >
        <aside className="w-[240px] h-screen bg-card border-r border-border flex flex-col justify-between shrink-0 overflow-y-auto">
          <div>
            <div className="px-6 py-8">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                {vendorData.role === "meat_vendor" ? (
                  <Drumstick className="h-6 w-6" />
                ) : (
                  <UtensilsCrossed className="h-6 w-6" />
                )}
                {vendorData.role === "meat_vendor" ? "Meat Center" : "VendorHub"}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mt-1">
                {vendorData.role === "meat_vendor" ? "Fresh Supplies" : "Precision Logistics"}
              </p>
            </div>

            <nav className="mt-4 flex flex-col gap-1 px-3">
              {navItems.map((item) => {
                let title = item.title;
                let url = item.url;
                let Icon = item.icon;

                if (vendorData.role === "meat_vendor" && item.title === "Menu Items") {
                  title = "Meat Inventory";
                  url = "/vendor/meat-menu";
                  Icon = Drumstick;
                }

                const isActive = location.pathname === url;
                return (
                  <Link
                    key={title}
                    to={url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-border">
            <div className="bg-muted/40 p-4 rounded-2xl mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {vendorData.name?.[0] || "V"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{vendorData.name || "Vendor"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{vendorData.email || "Partner"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          searchPlaceholder={searchPlaceholder}
          onToggleSidebar={toggleSidebar}
          profileName={vendorData.name || "Vendor"}
          profileRole={vendorData.role === "meat_vendor" ? "Meat Center" : "Active Shop"}
          avatarUrl={vendorData.avatarUrl}
        />

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
