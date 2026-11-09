import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { InfoNote } from "@/components/ui/InfoNote";
import { RefreshList } from "@/components/ui/RefreshList";
import type { ThemeTokens } from "@/constants/colors";
import type { PartnerOffer } from "@/types/insights";
import type { OffersStyles } from "../offers.styles";
import { OfferCard } from "./OfferCard";

interface Props {
  offers: PartnerOffer[];
  loading: boolean;
  error: boolean;
  togglingId?: string;
  onToggle: (offer: PartnerOffer, isActive: boolean) => void;
  onDelete: (offer: PartnerOffer) => void;
  refreshing: boolean;
  refresh: () => void;
  bottomInset: number;
  styles: OffersStyles;
  tokens: ThemeTokens;
}

/** The partner's offers, with the note on how they reach customers underneath. */
export function OffersList(p: Props) {
  const { t } = useTranslation();
  if (p.loading) return <FullScreenLoader color={p.tokens.brand} style={{ flex: 1 }} />;
  return (
    <RefreshList
      data={p.offers}
      keyExtractor={(offer) => offer._id}
      refreshing={p.refreshing}
      onRefresh={p.refresh}
      bottomInset={p.bottomInset}
      renderItem={(offer) => (
        <OfferCard offer={offer} toggling={p.togglingId === offer._id} onToggle={(v) => p.onToggle(offer, v)} onDelete={() => p.onDelete(offer)} styles={p.styles} tokens={p.tokens} />
      )}
      ListEmptyComponent={
        p.error ? (
          <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={p.refresh} />
        ) : (
          <EmptyState icon="pricetags-outline" title={t("offers.emptyTitle")} subtitle={t("offers.emptySubtitle")} />
        )
      }
      ListFooterComponent={p.offers.length > 0 ? <InfoNote lead={t("offers.howTitle")} text={t("offers.howBody")} /> : null}
    />
  );
}
