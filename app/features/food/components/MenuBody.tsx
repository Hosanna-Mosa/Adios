import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { MenuVegOnly } from "./MenuVegOnly";
import { outletClosedLabel } from "@/components/shared/outletClosed";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

import type { Props } from "./MenuBody.props";

export function MenuBody(props: Props) {
  const { CategoryTabs, accent, activeCategory, categoryPositions, categoryTabs, groupedMenu, handleAddToCart, handleCategoryPress, handleScroll, handleUpdateQuantity, highlightedItemId, items, loading, loadingItems, name, orderingState, outletClosed, scrollViewRef, scrolledPast, searchQuery, setSelectedDishDetail, styles, tabBarHeight, tokens, vegOnly } = props;
  const { t } = useTranslation();
  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <MenuVegOnly {...props} />

      {/* Browsing stays open; adding to the cart is refused while the outlet is closed. */}
      {outletClosed && (
        <View style={styles.closedBanner}>
          <Ionicons name="time-outline" size={moderateScale(20)} color={tokens.error} />
          <View style={{ flex: 1 }}>
            <Text style={styles.closedBannerTitle}>{outletClosedLabel(orderingState)}</Text>
            <Text style={styles.closedBannerText}>{t("app.food.closedBannerHint")}</Text>
          </View>
        </View>
      )}

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
            {searchQuery || vegOnly ? t("app.food.noDishesMatch") : t("app.food.menuNotAvailableYet")}
          </Text>
        </View>
      ) : (
        categoryTabs.map((category, categoryIndex) => (
          <View
            key={category}
            style={[styles.categorySection, categoryIndex === 0 && styles.categorySectionFirst]}
            onLayout={(e) => { categoryPositions.current[category] = e.nativeEvent.layout.y; }}
          >
            <View style={styles.categoryHeadRow}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.categoryCount}>{t("app.food.itemCount", { count: groupedMenu[category].length })}</Text>
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
                      source={item.images?.[0] ? { uri: item.images[0] } : null}
                      style={styles.rowImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {soldOut ? (
                      <View style={styles.soldOutBadge}><Text style={styles.soldOutText}>{t("app.food.soldOut")}</Text></View>
                    ) : outletClosed && !cartItem ? (
                      <TouchableOpacity style={styles.soldOutBadge} activeOpacity={0.7} onPress={() => handleAddToCart(item)}>
                        <Text style={styles.soldOutText}>{t("app.food.closedPill")}</Text>
                      </TouchableOpacity>
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
                        <TouchableOpacity style={[styles.qtyBtn, outletClosed && { opacity: 0.35 }]} onPress={() => handleAddToCart(item)} disabled={loadingItems[item._id]}>
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
