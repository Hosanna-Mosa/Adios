import React from "react";

// Props for MenuBody, kept beside it so neither file passes 150 lines.

export interface Props {
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
