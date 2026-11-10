import React, { useMemo } from "react";
import { Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { HomeFilter } from "./HomeFilter";
import { createFilterStyles } from "../homeFilter.styles";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type HomeStyles } from "../home.styles";
import { type EdgeInsets } from "react-native-safe-area-context";

// The "Filters and sorting" sheet: a dimmed backdrop, a round close button, and the panel.
// Veg / non-veg lives in the Home screen's Veg toggle, so it is not offered here, and neither
// is the 149 store.

interface Props {
  accent: ServiceTokens;
  activeFilterTab: string;
  availableCuisines: any[];
  clearAllFilters: () => void;
  filterCostRange: string;
  filterFastDelivery: boolean;
  filterMinRating: number;
  filterOffers: boolean;
  filterOpenNow: boolean;
  filteredAndSortedItems: any;
  insets: EdgeInsets;
  isFilterModalVisible: boolean;
  selectedCuisines: any[];
  selectedSort: string;
  setActiveFilterTab: React.Dispatch<React.SetStateAction<any>>;
  setFilterCostRange: React.Dispatch<React.SetStateAction<any>>;
  setFilterFastDelivery: React.Dispatch<React.SetStateAction<any>>;
  setFilterMinRating: React.Dispatch<React.SetStateAction<any>>;
  setFilterOffers: React.Dispatch<React.SetStateAction<any>>;
  setFilterOpenNow: React.Dispatch<React.SetStateAction<any>>;
  setIsFilterModalVisible: React.Dispatch<React.SetStateAction<any>>;
  setSelectedCuisines: React.Dispatch<React.SetStateAction<any>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<any>>;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeFilterModal(props: Props) {
  const { t } = useTranslation();
  const { isFilterModalVisible, setIsFilterModalVisible, styles, tokens, accent } = props;
  const s = useMemo(() => createFilterStyles(tokens, accent), [tokens, accent]);
  const close = () => setIsFilterModalVisible(false);
  return (
    <Modal visible={isFilterModalVisible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.filterModalOverlay}>
        <Pressable style={styles.filterModalScrim} onPress={close} accessibilityLabel={t("app.support.closeModal")} />
        <View style={s.closeWrap} pointerEvents="box-none">
          <Pressable onPress={close} hitSlop={8} style={s.closeCircle} accessibilityRole="button" accessibilityLabel={t("app.support.closeModal")}>
            <Ionicons name="close" size={moderateScale(22)} color={tokens.surface} />
          </Pressable>
        </View>
        <HomeFilter {...props} />
      </View>
    </Modal>
  );
}
