import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { OffersList } from "@/features/offers/components/OffersList";
import { useOffers } from "@/features/offers/useOffers";

export default function OffersScreen() {
  const { t } = useTranslation();
  const { insets, tokens, accent, styles, groups, isLoading, isError, isRefreshing, refetch, openVendor, goBack } = useOffers();

  return (
    <ScreenShell>
      <Header
        title={t("app.offers.title")}
        onBack={goBack}
        style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
      />
      <OffersList
        groups={groups}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        onRefresh={() => { void refetch(); }}
        onOpenVendor={openVendor}
        styles={styles}
        tokens={tokens}
        accent={accent}
        bottomInset={insets.bottom}
      />
    </ScreenShell>
  );
}
