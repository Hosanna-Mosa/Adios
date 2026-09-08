import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  CategoryTabs: any;
  accent: any;
  activeCategory: any;
  categoryPositions: any;
  categoryTabs: any[];
  groupedMenu: Record<string, any[]>;
  handleAddToCart: any;
  handleCategoryPress: any;
  handleScroll: any;
  handleUpdateQuantity: any;
  highlightedItemId: any;
  id: any;
  image: any;
  isMeat: any;
  items: any[];
  loading: any;
  loadingItems: any;
  metaLine1Parts: any;
  metaLine2Parts: any;
  name: any;
  rating: any;
  reviews: any;
  scrollViewRef: any;
  scrolledPast: any;
  searchQuery: any;
  setSearchQuery: React.Dispatch<React.SetStateAction<any>>;
  setSelectedDishDetail: React.Dispatch<React.SetStateAction<any>>;
  setVegOnly: React.Dispatch<React.SetStateAction<boolean>>;
  styles: any;
  tabBarHeight: any;
  tokens: any;
  vegOnly: any;
}

export function MenuBody({
  CategoryTabs,
  accent,
  activeCategory,
  categoryPositions,
  categoryTabs,
  groupedMenu,
  handleAddToCart,
  handleCategoryPress,
  handleScroll,
  handleUpdateQuantity,
  highlightedItemId,
  id,
  image,
  isMeat,
  items,
  loading,
  loadingItems,
  metaLine1Parts,
  metaLine2Parts,
  name,
  rating,
  reviews,
  scrollViewRef,
  scrolledPast,
  searchQuery,
  setSearchQuery,
  setSelectedDishDetail,
  setVegOnly,
  styles,
  tabBarHeight,
  tokens,
  vegOnly,
}: Props) {
  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 120 }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Image source={{ uri: (image as string) || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600" }} style={styles.heroImage} contentFit="cover" transition={200} />

      <View style={styles.sheet}>
        <TouchableOpacity
          style={styles.titleRow}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/restaurant-details",
              params: { id: id as string, name: name as string, image: image as string, rating: rating as string, reviews: reviews as string, isMeat: isMeat as string },
            })
          }
        >
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.sec} />
            </View>
            {metaLine1Parts.length > 0 && (
              <Text style={styles.metaLine} numberOfLines={1}>{metaLine1Parts.join(" · ")}</Text>
            )}
            {metaLine2Parts.length > 0 && (
              <Text style={styles.metaLine} numberOfLines={1}>{metaLine2Parts.join(" · ")}</Text>
            )}
          </View>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingPillValue}>{rating || "—"} ★</Text>
            {!!reviews && <Text style={styles.ratingPillCount}>{reviews}</Text>}
          </View>
        </TouchableOpacity>

        {isMeat !== "true" && (
          <View style={styles.vegRow}>
            <View style={styles.vegLeft}>
              <View style={styles.vegIconBox}><View style={styles.vegDot} /></View>
              <Text style={styles.vegLabel}>Veg only</Text>
            </View>
            <TouchableOpacity
              style={[styles.vegSwitch, vegOnly && { backgroundColor: tokens.veg }]}
              activeOpacity={0.8}
              onPress={() => setVegOnly((v) => !v)}
            >
              <View style={[styles.vegSwitchKnob, vegOnly && { alignSelf: "flex-end" }]} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchRow}>
          <Ionicons name="search" size={moderateScale(15)} color={tokens.sec} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${name}`}
            placeholderTextColor={tokens.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={moderateScale(15)} color={tokens.sec} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!scrolledPast && categoryTabs.length > 0 && (
        <View style={styles.inlineTabsBar}>
          <CategoryTabs categoryTabs={categoryTabs} activeCategory={activeCategory} onPress={handleCategoryPress} styles={styles} />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={accent.accent} style={{ marginTop: 60 }} />
      ) : categoryTabs.length === 0 ? (
        <View style={styles.emptyMenu}>
          <Ionicons name="search-outline" size={48} color={tokens.muted} />
          <Text style={styles.emptyText}>
            {searchQuery || vegOnly ? "No dishes match" : "Menu not available yet"}
          </Text>
        </View>
      ) : (
        categoryTabs.map((category) => (
          <View
            key={category}
            style={styles.categorySection}
            onLayout={(e) => { categoryPositions.current[category] = e.nativeEvent.layout.y; }}
          >
            <View style={styles.categoryHeadRow}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.categoryCount}>{groupedMenu[category].length} items</Text>
            </View>

            {groupedMenu[category].map((item, idx) => {
              const cartItem = items.find((i) => i._id === item._id);
              const soldOut = item.isAvailable === false;
              return (
                <Animated.View key={item._id} entering={staggerListItem(idx)}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelectedDishDetail(item)}
                  style={[
                    styles.menuRow,
                    idx < groupedMenu[category].length - 1 && styles.menuRowDivider,
                    highlightedItemId === item._id && styles.menuRowHighlighted,
                    soldOut && { opacity: 0.55 },
                  ]}
                >
                  <View style={styles.rowInfo}>
                    <View style={[styles.dietIcon, { borderColor: item.isVeg ? tokens.veg : tokens.nonveg }]}>
                      {item.isVeg ? (
                        <View style={[styles.vegDotSmall, { backgroundColor: tokens.veg }]} />
                      ) : (
                        <View style={styles.nonvegTriangle} />
                      )}
                    </View>
                    <Text style={styles.rowName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.rowPrice}>₹{item.price}</Text>
                    {!!item.description && (
                      <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text>
                    )}
                  </View>

                  <View style={styles.rowImageCol}>
                    <Image
                      source={{ uri: item.images?.[0] || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400" }}
                      style={styles.rowImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {soldOut ? (
                      <View style={styles.soldOutBadge}><Text style={styles.soldOutText}>Sold out</Text></View>
                    ) : cartItem ? (
                      <View style={styles.qtyPill}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQuantity(item._id, cartItem.quantity - 1)} disabled={loadingItems[item._id]}>
                          <Feather name="minus" size={14} color={accent.accent} />
                        </TouchableOpacity>
                        {loadingItems[item._id] ? (
                          <ActivityIndicator size="small" color={accent.accent} />
                        ) : (
                          <Text style={styles.qtyText}>{cartItem.quantity}</Text>
                        )}
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleAddToCart(item)} disabled={loadingItems[item._id]}>
                          <Feather name="plus" size={14} color={accent.accent} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => handleAddToCart(item)} disabled={loadingItems[item._id]}>
                        {loadingItems[item._id] ? <ActivityIndicator size="small" color={accent.accent} /> : <Text style={styles.addBtnText}>Add</Text>}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}
