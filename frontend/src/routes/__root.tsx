import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { RouteLoadingFallback } from "@/components/motion/RouteLoadingFallback";

interface LayoutProps {
  variant: "marketing" | "minimal";
}

export default function Layout({ variant }: LayoutProps) {
  const location = useLocation();

  return (
    <div>
      <Header variant={variant} />
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </AnimatePresence>
      <Footer variant={variant} />
    </div>
  );
}
