import { useMemo } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { translateFoodTag } from "@/i18n/foodTagLabels";
import { cuisineImageUrl } from "./CuisineStrip.images";

// "Cuisines and dishes": every cuisine on offer as a grid, opened from the "All" tile in
// Browse by cuisine. Picking one filters Home to it (picking the chosen one again clears it).

interface Props {
  visible: boolean;
  onClose: () => void;
  cuisines: string[];
  selectedCuisines: string[];
  setSelectedCuisines: (next: string[]) => void;
  tokens: ThemeTokens;
  accent: ServiceTokens;
  insets: EdgeInsets;
  /** "Cuisines and dishes" for food, "Meat types" for meat. */
  title: string;
}

const COLUMNS = 4;
const ms = moderateScale;

export function CuisinesSheet({ visible, onClose, cuisines, selectedCuisines, setSelectedCuisines, tokens, accent, insets, title }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens, accent), [tokens, accent]);

  const pick = (cuisine: string) => {
    const only = selectedCuisines.length === 1 && selectedCuisines[0] === cuisine;
    setSelectedCuisines(only ? [] : [cuisine]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("app.support.closeModal")} />
        <View style={s.closeWrap} pointerEvents="box-none">
          <Pressable onPress={onClose} hitSlop={8} style={s.close} accessibilityRole="button" accessibilityLabel={t("app.support.closeModal")}>
            <Ionicons name="close" size={ms(22)} color={tokens.surface} />
          </Pressable>
        </View>
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={s.title} accessibilityRole="header">{title}</Text>
          <FlatList
            data={cuisines}
            keyExtractor={(c) => c}
            numColumns={COLUMNS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.grid}
            renderItem={({ item }) => {
              const on = selectedCuisines.includes(item);
              return (
                <Pressable style={s.cell} onPress={() => pick(item)} accessibilityRole="button" accessibilityState={{ selected: on }}>
                  <View style={[s.circle, on && { borderColor: accent.accent, borderWidth: 2 }]}>
                    <Image source={{ uri: cuisineImageUrl(item) }} style={s.image} contentFit="cover" transition={150} />
                  </View>
                  <Text style={[s.name, on && { color: accent.accent, fontFamily: fontFamilies.body.bold }]} numberOfLines={1}>
                    {translateFoodTag(item, t)}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.55)" },
    closeWrap: { alignItems: "center", marginBottom: ms(14) },
    close: { width: ms(40), height: ms(40), borderRadius: ms(20), alignItems: "center", justifyContent: "center", backgroundColor: tokens.text },
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), maxHeight: "78%", paddingTop: ms(20) },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text, paddingHorizontal: ms(18), marginBottom: ms(8) },
    grid: { paddingHorizontal: ms(10), paddingBottom: ms(16) },
    cell: { width: `${100 / COLUMNS}%`, alignItems: "center", paddingVertical: ms(10), paddingHorizontal: ms(4) },
    circle: { width: ms(68), height: ms(68), borderRadius: ms(34), overflow: "hidden", backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border },
    image: { width: "100%", height: "100%" },
    name: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.sec, marginTop: ms(8), textAlign: "center", maxWidth: "100%" },
  });

