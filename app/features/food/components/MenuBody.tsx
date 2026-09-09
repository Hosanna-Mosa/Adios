import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { MenuVegOnly } from "./MenuVegOnly";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

import type { Props } from "./MenuBody.props";

export function MenuBody(props: Props) {
  const { CategoryTabs, accent, activeCategory, categoryPositions, categoryTabs, groupedMenu, handleAddToCart, handleCategoryPress, handleScroll, handleUpdateQuantity, highlightedItemId, items, loading, loadingItems, name, scrollViewRef, scrolledPast, searchQuery, setSelectedDishDetail, styles, tabBarHeight, tokens, vegOnly } = props;
  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 120 }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <MenuVegOnly {...props} />

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
