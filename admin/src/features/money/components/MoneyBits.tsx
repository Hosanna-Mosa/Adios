import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

/** Status chip used by both tables. */
export function StatusPill({ label, className, icon: Icon }: { label: string; className: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 whitespace-nowrap ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/** A value the admin pastes into their bank/UPI app, with a copy button. */
export function CopyValue({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  if (!value) return <p className="text-xs text-rose-600">{t("money.missingWithLabel", { label })}</p>;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("money.copiedSuffix", { label }));
    } catch {
      toast.error(t("money.copyFailedToast"));
    }
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono font-medium text-foreground select-all">{value}</span>
      <button type="button" onClick={copy} className="p-1 rounded hover:bg-muted" aria-label={t("money.copyAriaLabel", { label })}>
        <Copy className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

/** Segmented filter shown above each table. */
export function FilterTabs<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border p-1 bg-muted/30" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
          {typeof o.count === "number" && <span className="ml-1.5 text-xs text-muted-foreground">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
