import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";
import { Icon } from "@/components/shared/Icon";

// Each language names itself, in its own script — never translated.
const NATIVE_NAME: Record<SupportedLanguage, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी",
};

/** Small language dropdown for the site header — light-weight equivalent of
 * the mobile apps' language-settings screen, without a mandatory gate.
 * `variant="light"` swaps the trigger to white text for dark hero sections. */
export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  const { i18n } = useTranslation();
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
        aria-label="Change language"
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
          variant === "light"
            ? "text-white/80 hover:text-white"
            : "text-secondary-app hover:text-primary"
        }`}
      >
        <Icon name="language" className="text-base" />
        <span>{NATIVE_NAME[current]}</span>
        <Icon name="expand_more" className="text-sm" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-surface-container bg-white shadow-lg py-1 z-50">
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
                  : "text-secondary-app hover:bg-surface-soft"
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
