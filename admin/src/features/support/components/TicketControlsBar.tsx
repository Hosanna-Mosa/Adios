import { Filter, Search } from "lucide-react";

interface TicketControlsBarProps {
  activeTab: "ACTIVE" | "RESOLVED";
  onTabChange: (tab: "ACTIVE" | "RESOLVED") => void;
  activeCount: number;
  resolvedCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

/**
 * The tabs + search + category filter bar above SupportIssues' ticket
 * grid. A pill-style tab design, distinct from Support.tsx's underline
 * tabs (TicketStatusTabs, item #10) -- and Support.tsx never had a search
 * or category filter to reuse in the first place.
 */
export function TicketControlsBar({ activeTab, onTabChange, activeCount, resolvedCount, searchTerm, onSearchChange, categoryFilter, onCategoryChange }: TicketControlsBarProps) {
  return (
    <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20">
      <div className="flex bg-muted p-1 rounded-xl w-full md:w-auto">
        <button
          onClick={() => onTabChange("ACTIVE")}
          className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "ACTIVE" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Active Complaints ({activeCount})
        </button>
        <button
          onClick={() => onTabChange("RESOLVED")}
          className={`flex-1 md:flex-none px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === "RESOLVED" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, ID, or user..."
            className="w-full pl-9 pr-4 py-2 border border-border bg-card rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-3 py-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} className="bg-transparent text-xs font-medium text-foreground focus:outline-none border-none p-0 cursor-pointer">
            <option value="ALL">All Categories</option>
            <option value="OPERATIONAL ISSUE">Operational Issue</option>
            <option value="DELAYED DELIVERY">Delayed Delivery</option>
            <option value="MULTI-STOP ADJUSTMENT">Multi-Stop Adjustment</option>
            <option value="QUALITY CONTROL">Quality Control</option>
          </select>
        </div>
      </div>
    </div>
  );
}
