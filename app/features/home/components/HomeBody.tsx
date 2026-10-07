import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
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
import { HomeIntro } from "./HomeIntro";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

import type { Props } from "./HomeBody.props";

export function HomeBody(props: Props) {
  const { hasRidersButNoVendors, noRidersNearby, accent, activeFilterCount, activeService, appliedDistanceKm,
  areaLabel, areaLine, bannerIndexRef, bannerScrollX, carouselRef, cuisineChips, filterCostRange,
  filterFastDelivery, filterMinRating, filterOffers, filterOpenNow, filterVegNonVeg,
  filteredAndSortedItems, greetingAds, handleServiceSwitch, insets, onBannerScroll, promoCards,
  restaurants, searchBarAnimatedStyle, selectedCuisines, setActiveFilterTab, setFilterCostRange,
  setFilterFastDelivery, setFilterMinRating, setFilterOffers, setFilterOpenNow,
  setFilterVegNonVeg, setIsDistanceSheetOpen, setIsFilterModalVisible, setIsSearchActive,
  setSelectedCuisines, store149Items, styles, tokens } = props;
  const { t } = useTranslation();
  return (
    <>
    <View>
      <HomeIntro {...props} />

      {/* Service tiles: Food/Meat toggle + Ride/Task launchers */}
      <ServiceTiles
        styles={styles}
        tokens={tokens}
        activeService={activeService}
        handleServiceSwitch={handleServiceSwitch}
      />

      {hasRidersButNoVendors ? null : (
        <>
          {promoCards.length > 0 && (
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
          )}

          {greetingAds.length > 0 && greetingAds.map((banner, index) => (
            <View key={banner._id || index} style={styles.adCard}>
              <Image source={{ uri: banner.imageUrl }} style={styles.adImage} contentFit="cover" transition={200} />
              <View style={styles.adCaption}>
                <Text style={styles.adTitle}>{banner.title}</Text>
                {banner.description && <Text style={styles.adDescription}>{banner.description}</Text>}
              </View>
            </View>
          ))}

          {/* Nothing in the ₹149 store can be delivered with no rider on shift,
              so the rail comes down with the rest of the ordering surface. */}
          {activeService === "Food" && !noRidersNearby && store149Items.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeadRow}>
                <View style={styles.sectionHeadLeft}>
                  <Text style={styles.sectionTitle}>{t("app.home.mealsAt149")}</Text>
                  <Text style={styles.sectionMeta}>{t("app.home.ends11Pm")}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/149-store")}>
                  <Text style={styles.sectionSeeAll}>{t("app.home.seeAll")}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealsScrollContent}>
                {store149Items.map((item) => <Store149Card key={item._id} item={item} styles={styles} accent={accent} />)}
              </ScrollView>
            </View>
          )}

          {/* With no rider online nothing can be ordered, so the veg toggle,
              filter chips (incl. the 149 Store filter) and the cuisine strip
              come down along with the ₹149 rail above. */}
          {activeService === "Food" && !noRidersNearby && (
            <View style={styles.vegOnlyRow}>
              <View style={styles.vegOnlyLeft}>
                <View style={styles.vegOnlyIcon}><View style={styles.vegOnlyDot} /></View>
                <Text style={styles.vegOnlyLabel}>{t("app.home.vegOnly")}</Text>
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
          {!noRidersNearby && (
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
          )}

          {/* Browse by cuisine (Food) / meat type (Meat, no eyebrow label in the mockup) */}
          {!noRidersNearby && (
            <CuisineStrip
              styles={styles}
              activeService={activeService}
              cuisineChips={cuisineChips}
              selectedCuisines={selectedCuisines}
              setSelectedCuisines={setSelectedCuisines}
              accent={accent}
            />
          )}

          {filteredAndSortedItems.length > 0 && (
            <View style={styles.listHeadingBlock}>
              <Text style={styles.listHeading}>{activeService === "Meat" ? t("app.home.meatCenters") : t("app.home.allRestaurants")}</Text>
              {/* The count is a promise none of those outlets can keep while no
                  rider is online, so it is left off rather than contradicting the
                  notice right below it. */}
              {!noRidersNearby && (
                <Text style={styles.listHeadingMeta}>
                  {appliedDistanceKm
                    ? `${filteredAndSortedItems.length} outlets within ${appliedDistanceKm} km`
                    : `${filteredAndSortedItems.length} outlets near ${areaLabel}`}
                </Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
    </>
  );
}
