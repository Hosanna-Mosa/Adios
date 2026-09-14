import React from "react";
import { StyleSheet, Text, View, type ImageStyle, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { designTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

/**
 * The account avatar, in the one order the app shows it everywhere: the uploaded
 * photo, else the first letter of the name, else a generic person icon. The home
 * top bar used to jump straight to the icon even when the account had a name.
 */
interface Props {
  name?: string | null;
  imageUri?: string | null;
  /** Final diameter in dp — the caller scales it, the way its own styles do. */
  size: number;
  /** Merged over the circle, so a screen keeps its own border/background. */
  style?: StyleProp<ViewStyle & ImageStyle>;
  initialStyle?: StyleProp<TextStyle>;
}

/** First letter of the name, or "" when there is nothing to take one from. */
export function nameInitial(name?: string | null) {
  const letter = (name || "").trim().charAt(0);
  return letter ? letter.toUpperCase() : "";
}

export function Avatar({ name, imageUri, size, style, initialStyle }: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={[circle, style]} contentFit="cover" transition={200} />;
  }

  const initial = nameInitial(name);

  return (
    <View style={[styles.placeholder, circle, style]}>
      {initial ? (
        <Text style={[styles.initial, { color: tokens.sec }, initialStyle]}>{initial}</Text>
      ) : (
        <Ionicons name="person-outline" size={size * 0.42} color={tokens.sec} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  initial: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large },
});
