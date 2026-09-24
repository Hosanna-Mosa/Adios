import { Drumstick, IndianRupee } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { GlobalPrice } from "../hooks/useMeatPricing";

interface GlobalPriceListProps {
  prices: GlobalPrice[] | undefined;
  isLoading: boolean;
  onPriceChange: (name: string, value: string) => void;
}

/** The "Standard Chicken Items" price-editing list on MeatPricing. */
export function GlobalPriceList({ prices, isLoading, onPriceChange }: GlobalPriceListProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Drumstick className="h-5 w-5 text-primary" />
          {t("catalog.standardChickenItems")}
        </h2>
      </div>

      <StaggerList className="divide-y divide-border">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">{t("catalog.loadingGlobalPrices")}</div>
        ) : (
          prices?.map((item) => (
            <StaggerItem key={item.name} className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Drumstick className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{t("catalog.weightColon", { value: item.weight, defaultValue: "Weight: {{value}}" })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-40">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="number" className="pl-9 h-11 text-lg font-semibold" defaultValue={item.price} onChange={(e) => onPriceChange(item.name, e.target.value)} />
                </div>
                <span className="text-xs text-muted-foreground uppercase font-medium">{t("catalog.perUnit")}</span>
              </div>
            </StaggerItem>
          ))
        )}
      </StaggerList>
    </div>
  );
}
