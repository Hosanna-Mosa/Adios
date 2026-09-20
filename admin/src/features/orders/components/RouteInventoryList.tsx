import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { OrderStop, OrderStopItem } from "../orderDetailTypes";

interface RouteInventoryListProps {
  stops: OrderStop[] | undefined;
}

/** The "Route Inventory Stops" list on OrderDetail.tsx. */
export function RouteInventoryList({ stops }: RouteInventoryListProps) {
  return (
    <StaggerList className="mb-6">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Route Inventory Stops</p>
      {stops && stops.map((stop, index) => (
        <StaggerItem key={index} className="section-card border-l-4 border-l-primary mb-3">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{index + 1}</span>
              <span className="text-sm font-semibold text-foreground">{stop.address || "Stop Address"}</span>
            </div>
            <span className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground uppercase">{stop.type}</span>
          </div>
          {stop.items && (
            <div className="divide-y divide-border">
              {Array.isArray(stop.items) ? (
                (stop.items as OrderStopItem[]).map((item, j) => (
                  <div key={j} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-muted-foreground">x {item.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {JSON.stringify(stop.items)}
                </div>
              )}
            </div>
          )}
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
