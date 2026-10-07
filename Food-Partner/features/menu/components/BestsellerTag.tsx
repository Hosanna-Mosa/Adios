import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import type { FoodItem } from "@/types/models";
import type { MenuStyles } from "../menu.styles";

type Bestseller = Pick<FoodItem, "bestsellerMinOrders" | "orderCount" | "isBestseller">;

/** "badge" once the dish has earned it, the progress while promoted but short of the owner's count, else null. */
export function bestsellerStatus(item: Bestseller): { kind: "badge" } | { kind: "progress"; target: number; count: number } | null {
  const target = item.bestsellerMinOrders;
  if (target == null) return null;
  const count = item.orderCount ?? 0;
  // The server computes isBestseller; the fallback covers a response from before that field existed.
  const earned = item.isBestseller ?? count >= target;
  return earned ? { kind: "badge" } : { kind: "progress", target, count };
}

/** The "Bestseller" badge, or "Bestseller at 50 orders · 12 so far". */
export function BestsellerTag({ item, styles }: { item: Bestseller; styles: MenuStyles }) {
  const { t } = useTranslation();
  const status = bestsellerStatus(item);
  if (!status) return null;
  if (status.kind === "badge") return <Badge label={t("menu.bestseller")} tone="warning" icon="flame" />;
  return (
    <Text style={styles.bestsellerProgress} numberOfLines={1}>
      {t("menu.bestsellerProgress", { target: status.target, count: status.count })}
    </Text>
  );
}
