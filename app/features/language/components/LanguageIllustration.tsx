/* eslint-disable flavour/typography-tokens -- these are illustration glyphs, drawn far larger than any UI text size. */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale as ms } from "react-native-size-matters";
import { elevation, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// The language screen's artwork: three speech bubbles (A / అ / अ) with a thin orbit ring,
// sparkles and dots around them, in the app's burgundy.

interface Bubble {
  top: number;
  left: number;
  w: number;
  h: number;
  glyph: string;
  /** Tail position along the bottom edge, as a left offset (dp before scaling). */
  tailLeft: number;
  grey?: boolean;
}

// Positions follow the reference artwork, on a 250 x 232 stage.
const BUBBLES: Bubble[] = [
  { top: 22, left: 94, w: 108, h: 88, glyph: "A", tailLeft: 26 },
  { top: 82, left: 12, w: 84, h: 94, glyph: "అ", tailLeft: 12, grey: true },
  { top: 124, left: 94, w: 112, h: 96, glyph: "अ", tailLeft: 56 },
];

export function LanguageIllustration({ tokens }: { tokens: ThemeTokens }) {
  const dot = (top: number, left: number, size: number, color: string) => (
    <View key={`${top}-${left}`} style={{ position: "absolute", top: ms(top), left: ms(left), width: ms(size), height: ms(size), borderRadius: ms(size), backgroundColor: color }} />
  );
  return (
    <View style={styles.stage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* orbit ring */}
      <View style={[styles.ring, { borderColor: tokens.brand }]} />

      {BUBBLES.map((b) => {
        const bg = b.grey ? "#DADCE0" : tokens.surface;
        return (
          <View key={b.glyph} style={{ position: "absolute", top: ms(b.top), left: ms(b.left), width: ms(b.w), height: ms(b.h) }}>
            <View style={[styles.tail, { left: ms(b.tailLeft), backgroundColor: bg }]} />
            {b.grey ? (
              <LinearGradient colors={["#F1F2F4", "#CFD2D8"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={[styles.bubble, elevation.sm, { borderColor: "#E4E6EA" }]}>
                <Text style={[styles.glyph, { color: "#5B6270" }]}>{b.glyph}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.bubble, elevation.sm, { backgroundColor: bg, borderColor: tokens.border }]}>
                <Text style={[styles.glyph, { color: tokens.brand }]}>{b.glyph}</Text>
              </View>
            )}
          </View>
        );
      })}

      {/* sparkles, dots, ticks */}
      <MaterialCommunityIcons name="star-four-points" size={ms(28)} color={tokens.brand} style={{ position: "absolute", top: ms(48), left: ms(30) }} />
      <MaterialCommunityIcons name="star-four-points" size={ms(26)} color={tokens.sec} style={{ position: "absolute", top: ms(166), left: ms(220) }} />
      {dot(98, 2, 13, tokens.sec)}
      {dot(24, 62, 14, tokens.brand)}
      {dot(120, 204, 12, tokens.brand)}
      {dot(220, 60, 13, tokens.brand)}
      <View style={[styles.tick, { top: ms(6), left: ms(190), transform: [{ rotate: "-60deg" }], backgroundColor: tokens.brand }]} />
      <View style={[styles.tick, { top: ms(20), left: ms(214), transform: [{ rotate: "-30deg" }], backgroundColor: tokens.brand }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: ms(250), height: ms(232), alignSelf: "center" },
  ring: { position: "absolute", top: ms(46), left: ms(56), width: ms(176), height: ms(176), borderRadius: ms(88), borderWidth: 1 },
  bubble: { flex: 1, borderRadius: ms(32), borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  tail: { position: "absolute", bottom: ms(-6), width: ms(24), height: ms(24), transform: [{ rotate: "45deg" }], borderRadius: ms(4) },
  glyph: { fontFamily: fontFamilies.body.bold, fontSize: ms(58), lineHeight: ms(76), includeFontPadding: false },
  tick: { position: "absolute", width: 3, height: ms(18), borderRadius: 2 },
});
