import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/shared/Icon";

interface HeaderProps {
  /** "marketing" = Home's full scroll-aware nav with anchor links + download CTA.
   *  "minimal" = Partner's simple fixed back-to-home nav. */
  variant: "marketing" | "minimal";
}

export function Header({ variant }: HeaderProps) {
  if (variant === "minimal") return <MinimalHeader />;
  return <MarketingHeader />;
}

function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-white/95 backdrop-blur-md py-3 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border-surface-container"
          : "bg-transparent py-5 border-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-10 md:px-20 flex justify-between items-center w-full">
        <div className="flex items-center gap-16">
          <Link to="/" className="text-[28px] font-black tracking-tight text-primary font-display">
            Flavor
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            <a
              href="#services"
              className="text-sm font-semibold text-primary relative after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-primary transition-all"
            >
              Services
            </a>
            <a href="#experience" className="text-sm font-medium text-secondary-app hover:text-primary transition-colors">
              Experience
            </a>
            <a href="#logistics" className="text-sm font-medium text-secondary-app hover:text-primary transition-colors">
              Logistics
            </a>
            <Link to="/partner" className="text-sm font-medium text-secondary-app hover:text-primary transition-colors">
              Partners
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#download"
            className="text-sm font-semibold px-6 py-2.5 rounded transition-all duration-300 bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10"
          >
            Download App
          </a>
        </div>
      </div>
    </nav>
  );
}

function MinimalHeader() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-surface-container py-4">
      <div className="flex justify-between items-center px-6 max-w-[1280px] mx-auto">
        <Link to="/" className="font-display text-2xl font-extrabold text-brand-kinetic tracking-tighter">
          HYBRID
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-secondary-app hover:text-on-surface transition-colors flex items-center gap-1"
        >
          <Icon name="arrow_back" className="text-base" />
          Back to Home
        </Link>
      </div>
    </nav>
  );
}
