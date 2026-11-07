import { FlatList, RefreshControl, View } from "react-native";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import type { Offer } from "@/types/models";
import { type OfferGroup } from "../offerFormat";
import { type OffersStyles } from "../offers.styles";
import { OfferRestaurantCard } from "./OfferRestaurantCard";
import { OffersSkeleton } from "./OffersSkeleton";

// The body of app/offers.tsx: skeleton -> error (with retry) -> empty -> list.

interface Props {
  groups: OfferGroup[];
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenVendor: (vendor: Offer["vendor"]) => void;
  styles: OffersStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  bottomInset: number;
}

export function OffersList({ groups, isLoading, isError, isRefreshing, onRefresh, onOpenVendor, styles, tokens, accent, bottomInset }: Props) {
  const { t } = useTranslation();

  if (isLoading) return <OffersSkeleton styles={styles} />;

  if (isError) {
    return (
      <View style={styles.stateWrap}>
        <ErrorState title={t("app.offers.errorTitle")} subtitle={t("app.offers.errorSubtitle")} onRetry={onRefresh} />
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      keyExtractor={(g) => String(g.vendor._id)}
      renderItem={({ item }) => (
        <OfferRestaurantCard group={item} styles={styles} tokens={tokens} accent={accent} onPress={onOpenVendor} />
      )}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={accent.accent} colors={[accent.accent]} />}
      ListEmptyComponent={
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState icon="pricetags-outline" title={t("app.offers.emptyTitle")} subtitle={t("app.offers.emptySubtitle")} />
        </View>
      }
      // flexGrow: an empty list's EmptyState fills the screen and sits centred, like the
      // error state, instead of hugging the top.
      contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset + 24, flexGrow: 1 }]}
      showsVerticalScrollIndicator={false}
    />
  );
}
