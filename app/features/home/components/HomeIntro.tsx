import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { HomeTopBar } from "./HomeTopBar";
import type { Props } from "./HomeBody.props";

// The top of the home screen: address row, headline and the search bar that
// opens the search overlay. Split out of HomeBody to stay under 150 lines;
// the markup is unchanged.

export function HomeIntro(props: Props) {
  const { accent, activeService, areaLabel, areaLine, insets, searchBarAnimatedStyle,
  setIsDistanceSheetOpen, setIsSearchActive, styles, tokens } = props;
  const { t } = useTranslation();
  // A line break in a translation would put the rest of the headline on a hidden
  // second line (this one shows a single line), so breaks become spaces.
  const headline = (activeService === "Meat" ? t("app.home.freshMeatDaily") : t("app.home.cravingSomethingDelicious"))
    .replace(/\s*\n\s*/g, " ");

  // One line, as large as the width allows: the headline renders at the
  // extraLarge size and is scaled down only by exactly as much as it overflows.
  // (adjustsFontSizeToFit was unreliable on Android and often shrank it to its floor.)
  const [boxWidth, setBoxWidth] = React.useState(0);
  const [naturalWidth, setNaturalWidth] = React.useState(0);
  // A few dp of slack so rounding never tips the scaled line into an ellipsis.
  const laidOutWidth = naturalWidth + 4;
  const fit = boxWidth > 0 && naturalWidth > 0 && laidOutWidth > boxWidth ? boxWidth / laidOutWidth : 1;

  return (
    <>
      {/* Top row: delivery address + avatar. Needs the safe-area inset since
          this now scrolls under the status bar/notch with no hero banner
          behind it to absorb that space (the old gradient carousel had its
          own insets.top padding baked in). */}
      <HomeTopBar
        styles={styles}
        insets={insets}
        tokens={tokens}
        areaLabel={areaLabel}
        areaLine={areaLine}
        setIsDistanceSheetOpen={setIsDistanceSheetOpen}
      />

      {/* Headline — always one line, as large as the screen width allows. */}
      <View style={styles.headlineBox} onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}>
        <View style={styles.headlineMeasure} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Text style={[styles.headlineText, styles.headlineMeasureText]} numberOfLines={1} onLayout={(e) => setNaturalWidth(e.nativeEvent.layout.width)}>
            {headline}
          </Text>
        </View>
        <Text
          style={[
            styles.headlineText,
            fit < 1 && { width: laidOutWidth, transform: [{ scale: fit }], transformOrigin: "left center" },
          ]}
          numberOfLines={1}
          // Safety net only until the measurement lands, so the word is never cut off.
          adjustsFontSizeToFit={naturalWidth === 0}
          minimumFontScale={0.6}
          accessibilityRole="header"
        >
          {headline}
        </Text>
      </View>

      {/* Search bar */}
      <Animated.View style={searchBarAnimatedStyle}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={() => setIsSearchActive(true)}>
          <Ionicons name="search" size={moderateScale(16)} color={accent.accent} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {activeService === "Meat" ? t("app.home.searchMuttonCurryCutPrawns") : t("app.home.searchBiryaniBawarchi")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
