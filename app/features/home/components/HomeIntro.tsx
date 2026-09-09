import { Text, TouchableOpacity } from "react-native";
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

      {/* Headline */}
      <Text style={styles.headline}>
        {activeService === "Meat" ? "Fresh Meat Daily!" : "Craving something\ndelicious?"}
      </Text>

      {/* Search bar */}
      <Animated.View style={searchBarAnimatedStyle}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={() => setIsSearchActive(true)}>
          <Ionicons name="search" size={moderateScale(16)} color={accent.accent} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {activeService === "Meat" ? "Search “mutton curry cut”, “prawns”" : "Search “biryani”, “Bawarchi”"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
