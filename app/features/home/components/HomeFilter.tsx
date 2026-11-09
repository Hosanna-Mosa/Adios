import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { createFilterStyles } from "../homeFilter.styles";
import { CostCard, CuisinesCard, OffersCard, RatingCard, SortCard, TimeCard, type SectionProps } from "./HomeFilterSections";

// "Filters and sorting": a left rail of sections and, on the right, one scrolling page of
// cards. Tapping a rail item scrolls to its card; scrolling moves the highlight.

interface Props extends Omit<SectionProps, "s"> {
  activeFilterTab: string;
  clearAllFilters: () => void;
  filteredAndSortedItems: any;
  insets: EdgeInsets;
  setActiveFilterTab: (v: any) => void;
  setIsFilterModalVisible: (v: any) => void;
  accent: ServiceTokens;
  tokens: ThemeTokens;
  [key: string]: any;
}

type TabId = "Sort" | "Time" | "Rating" | "Cost" | "Offers" | "Cuisines";

export function HomeFilter(props: Props) {
  const { t } = useTranslation();
  const { accent, tokens, activeFilterTab, setActiveFilterTab, clearAllFilters, filteredAndSortedItems, insets, setIsFilterModalVisible } = props;
  const s = useMemo(() => createFilterStyles(tokens, accent), [tokens, accent]);

  const scrollRef = useRef<ScrollView>(null);
  const tops = useRef<Partial<Record<TabId, number>>>({});
  const lockUntil = useRef(0);

  const applied: Record<TabId, boolean> = {
    Sort: props.selectedSort !== "relevance",
    Time: props.filterOpenNow || props.filterFastDelivery,
    Rating: props.filterMinRating > 0,
    Cost: props.filterCostRange !== "all",
    Offers: props.filterOffers,
    Cuisines: props.selectedCuisines.length > 0,
  };
  const anyApplied = Object.values(applied).some(Boolean);

  const tabs: { id: TabId; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { id: "Sort", icon: "swap-vertical", label: t("app.home.filterSortBy", "Sort By") },
    { id: "Time", icon: "time-outline", label: t("app.home.filterTime", "Time") },
    { id: "Rating", icon: "star-outline", label: t("app.home.filterRating", "Rating") },
    { id: "Cost", icon: "cash-outline", label: t("app.home.filterCost", "Cost") },
    { id: "Offers", icon: "pricetag-outline", label: t("app.home.offers", "Offers") },
    { id: "Cuisines", icon: "restaurant-outline", label: t("app.home.cuisines", "Cuisines") },
  ];

  const goTo = (id: TabId, animated = true) => {
    setActiveFilterTab(id);
    // Scrolling by hand to the card fires scroll events; ignore them while it travels.
    lockUntil.current = Date.now() + 450;
    scrollRef.current?.scrollTo({ y: tops.current[id] ?? 0, animated });
  };

  // Opened from a chip that names a section: land on it.
  useEffect(() => {
    const id = tabs.find((x) => x.id === activeFilterTab)?.id;
    if (id && id !== "Sort") setTimeout(() => goTo(id, false), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Date.now() < lockUntil.current) return;
    const y = e.nativeEvent.contentOffset.y + 24;
    let current: TabId = "Sort";
    for (const tab of tabs) if ((tops.current[tab.id] ?? 0) <= y) current = tab.id;
    if (current !== activeFilterTab) setActiveFilterTab(current);
  };

  const mark = (id: TabId) => ({ onLayout: (e: any) => { tops.current[id] = e.nativeEvent.layout.y - 12; } });
  const sectionProps = { ...props, s } as SectionProps;
  const count = filteredAndSortedItems.length;

  return (
    <View style={s.sheet}>
      <View style={s.handle} />
      <View style={s.header}>
        <Text style={s.title} accessibilityRole="header">{t("app.home.filtersAndSorting", "Filters and sorting")}</Text>
        <Pressable onPress={clearAllFilters} hitSlop={10} disabled={!anyApplied} accessibilityRole="button">
          <Text style={[s.clearAll, { color: anyApplied ? accent.accent : tokens.muted }]}>{t("app.home.clearAll", "Clear all")}</Text>
        </Pressable>
      </View>

      <View style={s.body}>
        <ScrollView style={s.rail} contentContainerStyle={{ alignItems: "stretch" }} showsVerticalScrollIndicator={false}>
          {tabs.map((tab) => {
            const on = activeFilterTab === tab.id;
            return (
              <Pressable key={tab.id} style={[s.tab, on && s.tabActive]} onPress={() => goTo(tab.id)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                {applied[tab.id] && <View style={s.tabDot} />}
                <View style={[s.tabBadge, on && s.tabBadgeOn]}>
                  <Ionicons name={tab.icon} size={moderateScale(16)} color={on ? accent.on : tokens.sec} />
                </View>
                <Text style={[s.tabLabel, on && s.tabLabelActive]} numberOfLines={2}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView ref={scrollRef} style={s.content} contentContainerStyle={s.contentInner} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
          <View {...mark("Sort")}><SortCard {...sectionProps} /></View>
          <View {...mark("Time")}><TimeCard {...sectionProps} /></View>
          <View {...mark("Rating")}><RatingCard {...sectionProps} /></View>
          <View {...mark("Cost")}><CostCard {...sectionProps} /></View>
          <View {...mark("Offers")}><OffersCard {...sectionProps} /></View>
          <View {...mark("Cuisines")}><CuisinesCard {...sectionProps} /></View>
          <View style={{ height: moderateScale(40) }} />
        </ScrollView>
      </View>

      <View style={[s.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable style={s.closeBtn} onPress={() => setIsFilterModalVisible(false)} accessibilityRole="button">
          <Text style={s.closeText}>{t("app.home.close", "Close")}</Text>
        </Pressable>
        <Pressable
          style={[s.showBtn, { backgroundColor: accent.accent }]}
          onPress={() => setIsFilterModalVisible(false)}
          accessibilityRole="button"
        >
          <Text style={s.showText}>
            {anyApplied ? t("app.home.showResultsCount", { count, defaultValue: "Show results ({{count}})" }) : t("app.home.showResults", "Show results")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
