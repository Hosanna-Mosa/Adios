import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { type FilterStyles } from "../homeFilter.styles";

// The cards of the "Filters and sorting" sheet: one per kind of filter. Each reads and sets
// the same Home filter state as before; only the way it is laid out changed.

export interface SectionProps {
  accent: ServiceTokens;
  tokens: ThemeTokens;
  s: FilterStyles;
  availableCuisines: any[];
  filterCostRange: string;
  filterFastDelivery: boolean;
  filterMinRating: number;
  filterOffers: boolean;
  filterOpenNow: boolean;
  selectedCuisines: any[];
  selectedSort: string;
  setFilterCostRange: (v: any) => void;
  setFilterFastDelivery: (v: any) => void;
  setFilterMinRating: (v: any) => void;
  setFilterOffers: (v: any) => void;
  setFilterOpenNow: (v: any) => void;
  setSelectedCuisines: (v: any) => void;
  setSelectedSort: (v: any) => void;
}

function Tile({ on, label, icon, onPress, s, accent, tokens }: { on: boolean; label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void } & Pick<SectionProps, "s" | "accent" | "tokens">) {
  return (
    <Pressable onPress={onPress} style={[s.tile, on && s.tileOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      {icon ? <Ionicons name={icon} size={moderateScale(16)} color={on ? accent.on : tokens.sec} /> : null}
      <Text style={[s.tileText, on && s.tileTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function SortCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, selectedSort, setSelectedSort } = p;
  const options = [
    { id: "relevance", label: t("app.home.sortRelevance", "Relevance") },
    { id: "distance", label: "Distance: Nearest first" },
    { id: "time", label: "Delivery Time" },
    { id: "rating", label: "Rating" },
    { id: "costLowHigh", label: "Cost: Low to High" },
    { id: "costHighLow", label: "Cost: High to Low" },
  ];
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.sortBy", "Sort by")}</Text>
      <View style={s.sortList}>
        {options.map((o) => {
          const on = selectedSort === o.id;
          return (
            <Pressable key={o.id} style={s.option} onPress={() => setSelectedSort(o.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}>
              <Text style={[s.optionText, on && s.optionTextOn]}>{o.label}</Text>
              <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={moderateScale(20)} color={on ? accent.accent : tokens.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TimeCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, filterOpenNow, setFilterOpenNow, filterFastDelivery, setFilterFastDelivery } = p;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.filterTime", "Time")}</Text>
      <View style={s.tiles}>
        <Tile s={s} accent={accent} tokens={tokens} on={filterOpenNow} icon="storefront-outline" label={t("app.home.openNow", "Open now")} onPress={() => setFilterOpenNow(!filterOpenNow)} />
        <Tile s={s} accent={accent} tokens={tokens} on={filterFastDelivery} icon="flash-outline" label={t("app.home.nearAndFast", "Near & Fast")} onPress={() => setFilterFastDelivery(!filterFastDelivery)} />
      </View>
    </View>
  );
}

export function RatingCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, filterMinRating, setFilterMinRating } = p;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.restaurantRating", "Restaurant Rating")}</Text>
      <View style={s.tiles}>
        {[3.5, 4, 4.5].map((v) => (
          <Tile
            key={v} s={s} accent={accent} tokens={tokens} on={filterMinRating === v} icon="star"
            label={t("app.home.ratedAtLeast", { value: v.toFixed(1), defaultValue: "Rated {{value}}+" })}
            onPress={() => setFilterMinRating(filterMinRating === v ? 0 : v)}
          />
        ))}
      </View>
    </View>
  );
}

export function CostCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, filterCostRange, setFilterCostRange } = p;
  const ranges = [
    { id: "under300", label: t("app.home.costUnder300", "Under ₹300") },
    { id: "300to600", label: "₹300 – ₹600" },
    { id: "over600", label: t("app.home.costAbove600", "Above ₹600") },
  ];
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.costForTwo", "Cost for two")}</Text>
      <View style={s.tiles}>
        {ranges.map((r) => (
          <Tile key={r.id} s={s} accent={accent} tokens={tokens} on={filterCostRange === r.id} label={r.label} onPress={() => setFilterCostRange(filterCostRange === r.id ? "all" : r.id)} />
        ))}
      </View>
    </View>
  );
}

export function OffersCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, filterOffers, setFilterOffers } = p;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.offers", "Offers")}</Text>
      <View style={s.tiles}>
        <Tile s={s} accent={accent} tokens={tokens} on={filterOffers} icon="pricetag-outline" label={t("app.home.freeDeliverySpecialOffers")} onPress={() => setFilterOffers(!filterOffers)} />
      </View>
    </View>
  );
}

export function CuisinesCard(p: SectionProps) {
  const { t } = useTranslation();
  const { s, accent, tokens, availableCuisines, selectedCuisines, setSelectedCuisines } = p;
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t("app.home.cuisines", "Cuisines")}</Text>
      {availableCuisines.length === 0 ? (
        <Text style={s.note}>{t("app.home.noCuisinesAvailableInCurrentLocation")}</Text>
      ) : (
        <View style={s.tiles}>
          {availableCuisines.map((c) => {
            const on = selectedCuisines.includes(c);
            return (
              <Tile key={c} s={s} accent={accent} tokens={tokens} on={on} label={String(c)} onPress={() => setSelectedCuisines(on ? selectedCuisines.filter((x) => x !== c) : [...selectedCuisines, c])} />
            );
          })}
        </View>
      )}
    </View>
  );
}
