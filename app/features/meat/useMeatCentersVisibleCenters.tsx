import { useMemo } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { MeatTypeChip } from "./components/MeatTypeChip";
import { MeatQuickBody } from "./components/MeatQuickBody";
import { MEAT_TYPES } from "./useMeatCenters.shared";

// Split out of useMeatCenters so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useMeatCentersVisibleCenters(tokens: any, accent: any, styles: any, meatCenters: any, selectedCategory: any, setSelectedCategory: any, activeQuickFilters: any, searchOpen: any, searchText: any, setSearchText: any, toggleQuickFilter: any) {
  const { t } = useTranslation();
  const visibleCenters = useMemo(() => {
    let list = meatCenters;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((c: any) => {
        const cats = Array.isArray(c.categories) ? c.categories.join(" ") : c.categories || "";
        return c.name?.toLowerCase().includes(q) || cats.toLowerCase().includes(q);
      });
    }
    if (activeQuickFilters.has("fast")) {
      list = list.filter((c: any) => parseInt(c.time?.match(/\d+/)?.[0] || "999", 10) <= 30);
    }
    if (activeQuickFilters.has("rating")) {
      list = list.filter((c: any) => (c.rating || 0) >= 4.0);
    }
    if (activeQuickFilters.has("open")) {
      list = list.filter((c: any) => (c.openState ? c.openState.isOpen : c.isOpen !== false));
    }
    return list;
  }, [meatCenters, searchText, activeQuickFilters]);

  const openCount = useMemo(
    () => meatCenters.filter((c: any) => (c.openState ? c.openState.isOpen : c.isOpen !== false)).length,
    [meatCenters]
  );

  const renderHeader = () => (
    <>
      <Animated.View entering={fadeInUp(0)} style={styles.headline}>
        <Text style={styles.headlineText}>{t("app.meat.meatCentersNearYou")}</Text>
        <Text style={styles.headlineSub}>
          {openCount} of {meatCenters.length} {t("app.meat.openNowCutFreshOnOrder")}
        </Text>
      </Animated.View>

      {searchOpen && (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={moderateScale(16)} color={tokens.sec} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("app.meat.searchCentersOrMeatType")}
            placeholderTextColor={tokens.muted}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={moderateScale(16)} color={tokens.sec} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesRow}>
        {MEAT_TYPES.map((t, idx) => {
          const isActive = selectedCategory === t.name;
          return (
            <Animated.View key={t.name} entering={staggerListItem(idx)}>
              <MeatTypeChip
                isActive={isActive}
                t={t}
                accent={accent}
                setSelectedCategory={setSelectedCategory}
                styles={styles}
              />
            </Animated.View>
          );
        })}
      </ScrollView>

      <Animated.View entering={fadeInUp(120)} style={styles.chipsRow}>
        <MeatQuickBody
          activeQuickFilters={activeQuickFilters}
          styles={styles}
          toggleQuickFilter={toggleQuickFilter}
        />
      </Animated.View>
    </>
  );

  return { visibleCenters, renderHeader };
}
