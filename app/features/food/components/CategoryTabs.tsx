import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeBlurView } from "@/components/ui/SafeBlurView";
import { useThemeStore } from "@/contexts/themeStore";

// The menu's category filter. The active category sits in a frosted-glass
// bubble that glides to the next tab (spring) instead of jumping, and the
// strip scrolls itself so the active tab — which the menu's scroll-spy also
// moves — always stays in view. Single-feature for now: promote to
// components/ui/ or components/shared/ if a second feature needs it.

const BUBBLE_SPRING = { damping: 20, stiffness: 190, mass: 0.8 };

type TabLayout = { x: number; width: number };

export function CategoryTabs({ categoryTabs, activeCategory, onPress, styles }: { categoryTabs: string[]; activeCategory: string; onPress: (c: string) => void; styles: any }) {
  const isDark = useThemeStore((s) => s.theme) === "dark";
  const scrollRef = useRef<ScrollView>(null);
  const viewportWidth = useRef(0);
  const trackX = useRef(0);
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});

  const bubbleX = useSharedValue(0);
  const bubbleWidth = useSharedValue(0);
  // The first placement is instant, so a strip that mounts mid-menu (the
  // pinned copy) doesn't slide in from the left edge.
  const placed = useRef(false);

  const active = layouts[activeCategory];
  useEffect(() => {
    if (!active) return;
    if (!placed.current) {
      bubbleX.value = active.x;
      bubbleWidth.value = active.width;
      placed.current = true;
    } else {
      bubbleX.value = withSpring(active.x, BUBBLE_SPRING);
      bubbleWidth.value = withSpring(active.width, BUBBLE_SPRING);
    }
    const centred = trackX.current + active.x + active.width / 2 - viewportWidth.current / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, centred), animated: true });
  }, [active, bubbleX, bubbleWidth]);

  const bubbleStyle = useAnimatedStyle(() => ({
    width: bubbleWidth.value,
    opacity: bubbleWidth.value > 0 ? 1 : 0,
    transform: [{ translateX: bubbleX.value }],
  }));

  const onTabLayout = (cat: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => (prev[cat]?.x === x && prev[cat]?.width === width ? prev : { ...prev, [cat]: { x, width } }));
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsScrollContent}
      onLayout={(e) => { viewportWidth.current = e.nativeEvent.layout.width; }}
    >
      <View style={styles.tabsTrack} onLayout={(e) => { trackX.current = e.nativeEvent.layout.x; }}>
        <Animated.View pointerEvents="none" style={[styles.tabBubble, isDark ? styles.tabBubbleDark : styles.tabBubbleLight, bubbleStyle]}>
          <View style={[styles.tabBubbleGlass, isDark ? styles.tabBubbleGlassDark : styles.tabBubbleGlassLight]}>
            <SafeBlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={isDark ? ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.04)"] : ["rgba(255,255,255,0.98)", "rgba(255,255,255,0.6)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </Animated.View>

        {categoryTabs.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => onPress(cat)} onLayout={onTabLayout(cat)} style={styles.tabItem} activeOpacity={0.8}>
            <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]} numberOfLines={1}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
