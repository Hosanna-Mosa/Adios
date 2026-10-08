import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { useTranslation } from "react-i18next";
import type { OrderContact, OrderPackageDelivery, OrderStop, OrderStopItem } from "../orderDetailTypes";

interface RouteInventoryListProps {
  stops: OrderStop[] | undefined;
  /** Package delivery orders: shows the sender on the pickup stop and the receiver on the drop. */
  packageDelivery?: OrderPackageDelivery | null;
}

/**
 * A stop's item lines. The backend stores them as `items: { lines, instructions, ... }`;
 * older stops held a bare array. Anything else has no lines to list.
 */
function stopLines(items: OrderStop["items"]): OrderStopItem[] {
  if (Array.isArray(items)) return items as OrderStopItem[];
  const lines = (items as { lines?: unknown } | null | undefined)?.lines;
  return Array.isArray(lines) ? (lines as OrderStopItem[]) : [];
}

function stopInstructions(items: OrderStop["items"]): string {
  const value = (items as { instructions?: unknown } | null | undefined)?.instructions;
  return typeof value === "string" ? value.trim() : "";
}

/** The "Route Inventory Stops" list on OrderDetail.tsx. */
export function RouteInventoryList({ stops, packageDelivery }: RouteInventoryListProps) {
  const { t } = useTranslation();
  const contactFor = (type?: string): { label: string; contact?: OrderContact } | null => {
    if (!packageDelivery) return null;
    const kind = String(type || "").toLowerCase();
    if (kind === "pickup") return { label: t("service.sender"), contact: packageDelivery.pickupContact };
    if (kind === "drop") return { label: t("service.receiver"), contact: packageDelivery.dropContact };
    return null;
  };

  return (
    <StaggerList className="mb-6">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">{t("orders.routeInventoryStops")}</p>
      {stops && stops.map((stop, index) => {
        const lines = stopLines(stop.items);
        const instructions = stopInstructions(stop.items);
        const person = contactFor(stop.type);
        return (
          <StaggerItem key={index} className="section-card border-l-4 border-l-primary mb-3">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{index + 1}</span>
                <span className="text-sm font-semibold text-foreground">{stop.address || t("orders.stopAddress")}</span>
              </div>
              <span className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground uppercase">{stop.type}</span>
            </div>
            {person && (person.contact?.name || person.contact?.phone) && (
              <div className="px-4 py-3 text-sm text-foreground border-b border-border">
                <span className="text-muted-foreground">{person.label}: </span>
                {person.contact?.name}
                {person.contact?.phone && <span className="text-muted-foreground"> · {person.contact.phone}</span>}
              </div>
            )}
            {lines.length > 0 && (
              <div className="divide-y divide-border">
                {lines.map((item, j) => (
                  <div key={j} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-muted-foreground">x {item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
            {instructions && <div className="px-4 py-3 text-sm text-muted-foreground">{instructions}</div>}
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
