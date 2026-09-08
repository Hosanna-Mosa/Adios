import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { FilterChips } from "./FilterChips";
import { HomeTopBar } from "./HomeTopBar";
import { PromoCarousel } from "./PromoCarousel";
import { CuisineStrip } from "./CuisineStrip";
import { Store149Card } from "./Store149Card";
import { ServiceTiles } from "./ServiceTiles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  hasRidersButNoVendors: any;
  accent: any;
  activeFilterCount: any;
  activeService: any;
  appliedDistanceKm: any;
  areaLabel: any;
  areaLine: any;
  bannerIndexRef: any;
  bannerScrollX: any;
  carouselRef: any;
  cuisineChips: any;
  filterCostRange: any;
  filterFastDelivery: any;
  filterMinRating: any;
  filterOffers: any;
  filterOpenNow: any;
  filterVegNonVeg: any;
  filteredAndSortedItems: any;
  greetingAds: any[];
  handleServiceSwitch: any;
  insets: any;
  onBannerScroll: any;
  promoCards: any;
  restaurants: any;
  searchBarAnimatedStyle: any;
  selectedCuisines: any;
  setActiveFilterTab: any;
  setFilterCostRange: any;
  setFilterFastDelivery: any;
  setFilterMinRating: any;
  setFilterOffers: any;
  setFilterOpenNow: any;
  setFilterVegNonVeg: any;
  setIsDistanceSheetOpen: any;
  setIsFilterModalVisible: any;
  setIsSearchActive: any;
  setSelectedCuisines: any;
  store149Items: any[];
  styles: any;
  tokens: any;
}

export function HomeBody({
  hasRidersButNoVendors,
  accent,
  activeFilterCount,
  activeService,
  appliedDistanceKm,
  areaLabel,
  areaLine,
  bannerIndexRef,
  bannerScrollX,
  carouselRef,
  cuisineChips,
  filterCostRange,
  filterFastDelivery,
  filterMinRating,
  filterOffers,
  filterOpenNow,
  filterVegNonVeg,
  filteredAndSortedItems,
  greetingAds,
  handleServiceSwitch,
  insets,
  onBannerScroll,
  promoCards,
  restaurants,
  searchBarAnimatedStyle,
  selectedCuisines,
  setActiveFilterTab,
  setFilterCostRange,
  setFilterFastDelivery,
  setFilterMinRating,
  setFilterOffers,
  setFilterOpenNow,
  setFilterVegNonVeg,
  setIsDistanceSheetOpen,
  setIsFilterModalVisible,
  setIsSearchActive,
  setSelectedCuisines,
  store149Items,
  styles,
  tokens,
}: Props) {
  return (
    <>
    <View>
      {/* Top row: delivery address + avatar. Needs the safe-area inset since
          this now scrolls under the status bar/notch with no hero banner
          behind it to absorb that space (the old gradient carousel had its
          own insets.top padding baked in). */}
      <HomeTopBar
        styles={styles}
        insets={insets}
        tokens={tokens}
        areaLabel={areaLabel}
        areaLine={areaLine}
        setIsDistanceSheetOpen={setIsDistanceSheetOpen}
      />

      {/* Headline */}
      <Text style={styles.headline}>
        {activeService === "Meat" ? "Fresh Meat Daily!" : "Craving something\ndelicious?"}
      </Text>

      {/* Search bar */}
      <Animated.View style={searchBarAnimatedStyle}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={() => setIsSearchActive(true)}>
          <Ionicons name="search" size={moderateScale(16)} color={accent.accent} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {activeService === "Meat" ? "Search “mutton curry cut”, “prawns”" : "Search “biryani”, “Bawarchi”"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Service tiles: Food/Meat toggle + Ride/Task launchers */}
      <ServiceTiles
        styles={styles}
        tokens={tokens}
        activeService={activeService}
        handleServiceSwitch={handleServiceSwitch}
      />

      {hasRidersButNoVendors ? null : (
        <>
          <PromoCarousel
            styles={styles}
            promoCards={promoCards}
            accent={accent}
            tokens={tokens}
            carouselRef={carouselRef}
            bannerScrollX={bannerScrollX}
            onBannerScroll={onBannerScroll}
            bannerIndexRef={bannerIndexRef}
          />

          {greetingAds.length > 0 && greetingAds.map((banner, index) => (
            <View key={banner._id || index} style={styles.adCard}>
              <Image source={{ uri: banner.imageUrl }} style={styles.adImage} contentFit="cover" transition={200} />
              <View style={styles.adCaption}>
                <Text style={styles.adTitle}>{banner.title}</Text>
                {banner.description && <Text style={styles.adDescription}>{banner.description}</Text>}
              </View>
            </View>
          ))}

          {activeService === "Food" && store149Items.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeadRow}>
                <View style={styles.sectionHeadLeft}>
                  <Text style={styles.sectionTitle}>Meals at ₹149</Text>
                  <Text style={styles.sectionMeta}>ends 11 PM</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/149-store")}>
                  <Text style={styles.sectionSeeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealsScrollContent}>
                {store149Items.map((item) => <Store149Card key={item._id} item={item} styles={styles} accent={accent} />)}
              </ScrollView>
            </View>
          )}

          {activeService === "Food" && (
            <View style={styles.vegOnlyRow}>
              <View style={styles.vegOnlyLeft}>
                <View style={styles.vegOnlyIcon}><View style={styles.vegOnlyDot} /></View>
                <Text style={styles.vegOnlyLabel}>Veg only</Text>
              </View>
              <TouchableOpacity
                style={[styles.vegSwitchTrack, filterVegNonVeg === "veg" && { backgroundColor: tokens.veg }]}
                activeOpacity={0.85}
                onPress={() => setFilterVegNonVeg(filterVegNonVeg === "veg" ? "all" : "veg")}
              >
                <View style={[styles.vegSwitchThumb, filterVegNonVeg === "veg" && { alignSelf: "flex-end" }]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Filter chips — quick filters differ per service, "Filter" always opens the full modal */}
          <FilterChips
            styles={styles}
            accent={accent}
            activeService={activeService}
            activeFilterCount={activeFilterCount}
            filterMinRating={filterMinRating}
            filterOpenNow={filterOpenNow}
            filterCostRange={filterCostRange}
            filterFastDelivery={filterFastDelivery}
            filterOffers={filterOffers}
            filterVegNonVeg={filterVegNonVeg}
            setFilterMinRating={setFilterMinRating}
            setFilterOpenNow={setFilterOpenNow}
            setFilterFastDelivery={setFilterFastDelivery}
            setFilterOffers={setFilterOffers}
            setFilterVegNonVeg={setFilterVegNonVeg}
            setActiveFilterTab={setActiveFilterTab}
            setIsFilterModalVisible={setIsFilterModalVisible}
            selectedCuisines={selectedCuisines}
            setSelectedCuisines={setSelectedCuisines}
            setFilterCostRange={setFilterCostRange}
          />

          {/* Browse by cuisine (Food) / meat type (Meat, no eyebrow label in the mockup) */}
          <CuisineStrip
            styles={styles}
            activeService={activeService}
            cuisineChips={cuisineChips}
            selectedCuisines={selectedCuisines}
            setSelectedCuisines={setSelectedCuisines}
            accent={accent}
          />

          {filteredAndSortedItems.length > 0 && (
            <View style={styles.listHeadingBlock}>
              <Text style={styles.listHeading}>{activeService === "Meat" ? "Meat centers" : "All restaurants"}</Text>
              <Text style={styles.listHeadingMeta}>
                {appliedDistanceKm
                  ? `${filteredAndSortedItems.length} outlets within ${appliedDistanceKm} km`
                  : `${filteredAndSortedItems.length} outlets near ${areaLabel}`}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
    </>
  );
}
