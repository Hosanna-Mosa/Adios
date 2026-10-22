import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { OfferSheet } from "@/features/offers/components/OfferSheet";
import { OffersList } from "@/features/offers/components/OffersList";
import { useOffers } from "@/features/offers/useOffers";

/** Offers the outlet runs for its own customers: create a code, switch it on or off, remove it. */
export default function OffersScreen() {
  const { t } = useTranslation();
  const o = useOffers();
  const header = (
    <Header
      title={t("offers.title")}
      onBack={() => router.back()}
      right={<Button title={t("offers.add")} size="sm" icon={<Ionicons name="add" size={18} color={o.tokens.onBrand} />} onPress={o.openSheet} />}
    />
  );

  return (
    <ScreenShell style={{ paddingTop: o.insets.top + 8 }} header={header}>
      <OffersList
        offers={o.offers}
        loading={o.loading}
        error={o.error}
        togglingId={o.togglingId}
        onToggle={o.setActive}
        onDelete={o.confirmDelete}
        refreshing={o.refreshing}
        refresh={() => o.refetch()}
        bottomInset={o.insets.bottom + 16}
        styles={o.styles}
        tokens={o.tokens}
      />
      <OfferSheet visible={o.sheetOpen} form={o.form} update={o.update} errors={o.errors} serverError={o.serverError} saving={o.saving} onSubmit={o.submit} onClose={o.closeSheet} styles={o.styles} />
    </ScreenShell>
  );
}
