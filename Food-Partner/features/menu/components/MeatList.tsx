import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { InfoNote } from "@/components/ui/InfoNote";
import { RefreshList } from "@/components/ui/RefreshList";
import type { ThemeTokens } from "@/constants/colors";
import type { MeatItem } from "@/types/models";
import type { MeatStyles } from "../meat.styles";
import { MeatItemCard } from "./MeatItemCard";

interface Props {
  items: MeatItem[];
  hasItems: boolean;
  loading: boolean;
  error: boolean;
  togglingId?: string;
  toggleAvailability: (item: MeatItem, isAvailable: boolean) => void;
  startEditing: (item: MeatItem) => void;
  refreshing: boolean;
  refresh: () => void;
  bottomInset: number;
  styles: MeatStyles;
  tokens: ThemeTokens;
}

/** The centre's items, with the panel's "your daily controls" note underneath. */
export function MeatList(p: Props) {
  const { t } = useTranslation();
  if (p.loading) return <FullScreenLoader color={p.tokens.brand} style={{ flex: 1 }} />;
  return (
    <RefreshList
      data={p.items}
      keyExtractor={(item) => item._id}
      refreshing={p.refreshing}
      onRefresh={p.refresh}
      bottomInset={p.bottomInset}
      renderItem={(item) => (
        <MeatItemCard
          item={item}
          toggling={p.togglingId === item._id}
          onToggle={(value) => p.toggleAvailability(item, value)}
          onEditPrice={() => p.startEditing(item)}
          styles={p.styles}
          tokens={p.tokens}
        />
      )}
      ListEmptyComponent={
        p.error ? (
          <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={p.refresh} />
        ) : (
          <EmptyState icon="file-tray-outline" title={t("meat.emptyTitle")} subtitle={t("meat.emptySubtitle")} />
        )
      }
      ListFooterComponent={p.hasItems ? <InfoNote lead={t("meat.dailyControlsTitle")} text={t("meat.dailyControlsBody")} style={p.styles.note} /> : null}
    />
  );
}
