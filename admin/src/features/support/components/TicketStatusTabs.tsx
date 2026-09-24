import { useTranslation } from "react-i18next";

interface TicketStatusTabsProps {
  activeTab: "ACTIVE" | "RESOLVED";
  onTabChange: (tab: "ACTIVE" | "RESOLVED") => void;
  openCount: number;
  resolvedCount: number;
}

/** The Active/Resolved tab switcher above the ticket list. */
export function TicketStatusTabs({ activeTab, onTabChange, openCount, resolvedCount }: TicketStatusTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex border-b border-border">
      <button
        onClick={() => onTabChange("ACTIVE")}
        className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-all ${
          activeTab === "ACTIVE" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("support.activeComplaintsCount", { count: openCount, defaultValue: "Active Complaints ({{count}})" })}
      </button>
      <button
        onClick={() => onTabChange("RESOLVED")}
        className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-all ${
          activeTab === "RESOLVED" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        {t("support.resolvedCount", { count: resolvedCount, defaultValue: "Resolved ({{count}})" })}
      </button>
    </div>
  );
}
