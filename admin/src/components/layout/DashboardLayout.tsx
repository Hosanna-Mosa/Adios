import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { PageTransition } from "@/components/motion/PageTransition";

interface DashboardLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
}

export function DashboardLayout({ children, searchPlaceholder }: DashboardLayoutProps) {
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
        animate={{ width: isSidebarOpen ? 240 : 0 }}
        transition={{ type: "tween", duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden flex shrink-0 sticky top-0 h-screen"
      >
        <AppSidebar />
      </motion.div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar searchPlaceholder={searchPlaceholder} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
