import { ReactNode, Suspense, useLayoutEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { RouteContentFallback } from "@/components/motion/RouteLoadingFallback";
import { ShellContext, useShell } from "./ShellContext";

interface DashboardLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
}

function DashboardFrame({ children, searchPlaceholder }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar_open");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("sidebar_open", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 0 }}
        transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden flex shrink-0 sticky top-0 h-screen"
      >
        <AppSidebar />
      </motion.div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar searchPlaceholder={searchPlaceholder} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Route layout: mounted once, so the sidebar and top bar stay put between pages. */
export function DashboardShell() {
  const location = useLocation();
  const [searchPlaceholder, setSearchPlaceholder] = useState<string>();
  const value = useMemo(() => ({ setSearchPlaceholder }), []);

  return (
    <ShellContext.Provider value={value}>
      <DashboardFrame searchPlaceholder={searchPlaceholder}>
        <Suspense fallback={<RouteContentFallback />}>
          {/* key: fresh mount (and entrance animation) between pages, including
              two params of one route, e.g. /users/1 -> /users/2 */}
          <Outlet key={location.pathname} />
        </Suspense>
      </DashboardFrame>
    </ShellContext.Provider>
  );
}

export function DashboardLayout({ children, searchPlaceholder }: DashboardLayoutProps) {
  const shell = useShell();

  useLayoutEffect(() => {
    shell?.setSearchPlaceholder(searchPlaceholder);
  }, [shell, searchPlaceholder]);

  if (shell) return <PageTransition>{children}</PageTransition>;

  return (
    <DashboardFrame searchPlaceholder={searchPlaceholder}>
      <PageTransition>{children}</PageTransition>
    </DashboardFrame>
  );
}
