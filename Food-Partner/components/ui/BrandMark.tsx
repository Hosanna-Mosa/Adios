import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import { designTokens, elevation, gradients, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  /** Tile size in dp before scaling. */
  size?: number;
  /** Shows "Flavour" + the caption under the tile. */
  wordmark?: boolean;
  caption?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** The app's logo: a brand-gradient tile with a restaurant glyph, optionally with the wordmark. */
export function BrandMark({ size = 72, wordmark = false, caption, icon = "restaurant" }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const d = moderateScale(size);

  return (
    <View style={styles.wrap}>
      <View style={[styles.tile, { width: d, height: d, borderRadius: d * 0.3 }]}>
        <LinearGradient colors={gradients[theme].brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <Ionicons name={icon} size={d * 0.48} color={tokens.onBrand} />
      </View>
      {wordmark ? (
        <View style={styles.words}>
          <Text style={styles.wordmark}>Flavour</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      alignItems: "center",
      gap: 14,
    },
    tile: {
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...elevation.md,
    },
    words: {
      alignItems: "center",
      gap: 2,
    },
    wordmark: {
      fontFamily: fontFamilies.heading.bold,
      fontSize: typography.sizes.extraLarge,
      lineHeight: typography.lineHeights.extraLarge,
      letterSpacing: -0.5,
      color: tokens.text,
    },
    caption: {
      fontFamily: fontFamilies.body.bold,
      fontSize: typography.sizes.small,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: tokens.brand,
    },
  });
