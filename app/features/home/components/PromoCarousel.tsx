import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { hasLink, openLink } from "@/utils/openLink";
import { type PromoCard } from "../useHomeAvailableCuisines";
import Animated from "react-native-reanimated";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { STRIDE } from "../constants";
import { PromoDot } from "./PromoDot";
import { type HomeStyles } from "../home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from the
// screen's scope is now passed in as props.

interface Props {
  styles: HomeStyles;
  promoCards: PromoCard[];
  accent: ServiceTokens;
  tokens: ThemeTokens;
  carouselRef: any;
  bannerScrollX: any;
  onBannerScroll: () => void;
  bannerIndexRef: { current: number };
}

export function PromoCarousel({
  styles,
  promoCards,
  accent,
  tokens,
  carouselRef,
  bannerScrollX,
  onBannerScroll,
  bannerIndexRef,
}: Props) {
  return (
  <View style={styles.promoSection}>
    <Animated.ScrollView
      ref={carouselRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={STRIDE}
      decelerationRate="fast"
      contentContainerStyle={styles.promoScrollContent}
      onScroll={onBannerScroll}
      onMomentumScrollEnd={(e) => {
        bannerIndexRef.current = Math.round(e.nativeEvent.contentOffset.x / STRIDE);
      }}
      scrollEventThrottle={16}
    >
      {promoCards.map((promo, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [styles.promoCard, index === 0 ? { backgroundColor: accent.skin } : { backgroundColor: tokens.sunken }, pressed && { opacity: 0.85 }]}
          // A banner with its own link opens that; every other card leads to the Offers page.
          onPress={() => (hasLink(promo.targetUrl) ? openLink(promo.targetUrl) : router.push("/offers"))}
          accessibilityRole="link"
          accessibilityLabel={promo.headline}
        >
          <View>
            <Text style={[styles.promoEyebrow, { color: index === 0 ? accent.accent : tokens.sec }]}>{promo.eyebrow}</Text>
            <Text style={styles.promoHeadline}>{promo.headline}</Text>
          </View>
          {!!promo.caption && <Text style={styles.promoCaption}>{promo.caption}</Text>}
        </Pressable>
      ))}
    </Animated.ScrollView>
    {promoCards.length > 1 && (
      <View style={styles.promoDotsRow}>
        {promoCards.map((_, i) => (
          <PromoDot
            key={i}
            index={i}
            scrollX={bannerScrollX}
            baseStyle={styles.promoDot}
            activeColor={accent.accent}
            inactiveColor={tokens.borderStrong}
          />
        ))}
      </View>
    )}
  </View>
);
}
