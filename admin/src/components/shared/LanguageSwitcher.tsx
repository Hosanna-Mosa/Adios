import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages, ChevronDown } from "lucide-react";
import { setLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

// Each language names itself, in its own script — never translated.
const NATIVE_NAME: Record<SupportedLanguage, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी",
};

/** Small language dropdown for TopBar — shared by the admin/support
 * DashboardLayout and the vendor-portal VendorLayout. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = (i18n.language as SupportedLanguage) || "en";

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("languageSwitcher.changeLanguage")}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Languages className="h-4 w-4" />
        <span>{NATIVE_NAME[current]}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-border bg-card shadow-lg py-1 z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang === current
                  ? "text-primary font-semibold bg-primary/5"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {NATIVE_NAME[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
