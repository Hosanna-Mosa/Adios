import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { STRIDE } from "../constants";
import { PromoDot } from "./PromoDot";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from the
// screen's scope is now passed in as props.

interface Props {
  styles: HomeStyles;
  promoCards: { eyebrow: string; headline: string; caption: string }[];
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
        <View key={index} style={[styles.promoCard, index === 0 ? { backgroundColor: accent.skin } : { backgroundColor: tokens.sunken }]}>
          <View>
            <Text style={[styles.promoEyebrow, { color: index === 0 ? accent.accent : tokens.sec }]}>{promo.eyebrow}</Text>
            <Text style={styles.promoHeadline} numberOfLines={2}>{promo.headline}</Text>
          </View>
          {!!promo.caption && <Text style={styles.promoCaption} numberOfLines={2}>{promo.caption}</Text>}
        </View>
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
