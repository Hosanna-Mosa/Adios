import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createStyles } from "@/features/meat/meat-centers.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";

import { fadeInUp, staggerListItem } from "@/motion/presets";
import { MeatCentersTopRow } from "@/features/meat/components/MeatCentersTopRow";
import { MeatCentersCenterContainer } from "@/features/meat/components/MeatCentersCenterContainer";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { MeatCentersBody } from "@/features/meat/components/MeatCentersBody";
import { MeatTypeChip } from "@/features/meat/components/MeatTypeChip";
import { MeatQuickBody } from "@/features/meat/components/MeatQuickBody";

const MEAT_TYPES = [
  { name: "Chicken", emoji: "🐔" },
  { name: "Mutton", emoji: "🐐" },
  { name: "Fish", emoji: "🐟" },
  { name: "Prawns", emoji: "🦐" },
  { name: "Eggs", emoji: "🥚" },
];

type QuickFilter = "fast" | "rating" | "open";

export default function MeatCentersScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.meat;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [meatCenters, setMeatCenters] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const getCoords = async () => {
    if (selectedAddress) {
      const lat = selectedAddress.coordinates?.lat ?? selectedAddress.location?.coordinates?.[1];
      const lng = selectedAddress.coordinates?.lng ?? selectedAddress.location?.coordinates?.[0];
      if (lat != null && lng != null) return { lat, lng };
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return { lat: 17.4447, lng: 78.3498 };
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  };

  const fetchMeatCenters = async (lat: number, lng: number, pageNum: number = 1, category: string | null = null) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      let url = `/meat/nearby?lat=${lat}&lng=${lng}&page=${pageNum}&limit=20`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      // Rating and open-now are evaluated server-side, so paging keeps honouring
      // them instead of re-introducing centres the filter already removed.
      if (activeQuickFilters.has("rating")) url += "&minRating=4";
      if (activeQuickFilters.has("open")) url += "&openNow=true";

      const data = await customFetch<any>(url);

      if (Array.isArray(data)) {
        setHasMore(data.length >= 20);
        setMeatCenters((prev) => (pageNum === 1 ? data : [...prev, ...data]));
      }
    } catch (error) {
      console.error("Error fetching meat centers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const activeStr = await AsyncStorage.getItem("active_address");
          if (activeStr) setSelectedAddress(JSON.parse(activeStr));
        } catch (e) {
          console.error("Failed to load active address:", e);
        }
      })();
    }, [])
  );

  // Set identity changes on every toggle, so key the refetch on the contents.
  const quickFilterKey = useMemo(() => Array.from(activeQuickFilters).sort().join(","), [activeQuickFilters]);

  useEffect(() => {
    (async () => {
      setPage(1);
      setHasMore(true);
      const { lat, lng } = await getCoords();
      fetchMeatCenters(lat, lng, 1, selectedCategory);
    })();
  }, [selectedAddress, selectedCategory, quickFilterKey]);

  const loadMore = async () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      const { lat, lng } = await getCoords();
      fetchMeatCenters(lat, lng, nextPage, selectedCategory);
    }
  };

  const toggleQuickFilter = (key: QuickFilter) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleCenters = useMemo(() => {
    let list = meatCenters;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((c) => {
        const cats = Array.isArray(c.categories) ? c.categories.join(" ") : c.categories || "";
        return c.name?.toLowerCase().includes(q) || cats.toLowerCase().includes(q);
      });
    }
    if (activeQuickFilters.has("fast")) {
      list = list.filter((c) => parseInt(c.time?.match(/\d+/)?.[0] || "999", 10) <= 30);
    }
    if (activeQuickFilters.has("rating")) {
      list = list.filter((c) => (c.rating || 0) >= 4.0);
    }
    if (activeQuickFilters.has("open")) {
      list = list.filter((c) => (c.openState ? c.openState.isOpen : c.isOpen !== false));
    }
    return list;
  }, [meatCenters, searchText, activeQuickFilters]);

  const openCount = useMemo(
    () => meatCenters.filter((c) => (c.openState ? c.openState.isOpen : c.isOpen !== false)).length,
    [meatCenters]
  );

  const renderHeader = () => (
    <>
      <Animated.View entering={fadeInUp(0)} style={styles.headline}>
        <Text style={styles.headlineText}>Meat centers near you</Text>
        <Text style={styles.headlineSub}>
          {openCount} of {meatCenters.length} open now · cut fresh on order
        </Text>
      </Animated.View>

      {searchOpen && (
        <View style={styles.searchRow}>
          <Ionicons name="search" size={moderateScale(16)} color={tokens.sec} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search centers or meat type"
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

  return (
    <ScreenShell>
      <MeatCentersTopRow
        insets={insets}
        searchOpen={searchOpen}
        selectedAddress={selectedAddress}
        setSearchOpen={setSearchOpen}
        styles={styles}
        tokens={tokens}
      />

      {loading && meatCenters.length === 0 ? (
        <MeatCentersCenterContainer
          accent={accent}
          styles={styles}
        />
      ) : (
        <MeatCentersBody
          accent={accent}
          fetchMeatCenters={fetchMeatCenters}
          getCoords={getCoords}
          loadMore={loadMore}
          loading={loading}
          loadingMore={loadingMore}
          renderHeader={renderHeader}
          selectedCategory={selectedCategory}
          setHasMore={setHasMore}
          setPage={setPage}
          visibleCenters={visibleCenters}
        />
      )}
    </ScreenShell>
  );
}
