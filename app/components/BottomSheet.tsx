import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// Gap kept between a fully expanded sheet and the bottom of the status bar.
const TOP_GAP = 12;

interface Props {
  children: React.ReactNode;
  style?: any;
  defaultHeight?: number;
  disableExpand?: boolean;
  /** Kept in sync with the sheet's live visible height (post-gesture/spring),
   * so a caller positioning UI above this sheet (e.g. the map's zoom
   * controls) can track it as the user drags, instead of assuming it always
   * sits at defaultHeight. The sheet's own layout height never changes --
   * only its transform does -- so onLayout can't see this; this is the one
   * live signal available. */
  heightValue?: SharedValue<number>;
}

/**
 * Draggable sheet: rests at `defaultHeight`, expands to just below the status
 * bar. The window size is read live, so it follows rotation and split-screen;
 * it used to read the screen once at load and expand under the status bar.
 */
export function BottomSheet({ children, style, defaultHeight = 220, disableExpand = false, heightValue }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);

  const MIN_TRANSLATE_Y = -defaultHeight;
  const MAX_TRANSLATE_Y = -(windowHeight - insets.top - TOP_GAP);

  const translateY = useSharedValue(MIN_TRANSLATE_Y);
  const context = useSharedValue({ y: 0 });

  // Spring animate transition to new defaultHeight dynamically when state changes
  React.useEffect(() => {
    translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
  }, [defaultHeight]);

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-20, 20])
    .onStart(() => {
      if (disableExpand) return;
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      if (disableExpand) return;
      translateY.value = event.translationY + context.value.y;
      // Clamp values so it doesn't go off screen
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      translateY.value = Math.min(translateY.value, MIN_TRANSLATE_Y);
    })
    .onEnd((event) => {
      if (disableExpand) return;
      // Determine snap point based on velocity and position
      if (translateY.value < MIN_TRANSLATE_Y - 50 || event.velocityY < -500) {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      } else {
        translateY.value = withSpring(MIN_TRANSLATE_Y, { damping: 50 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  useAnimatedReaction(
    () => -translateY.value,
    (visibleHeight) => {
      if (heightValue) heightValue.value = visibleHeight;
    },
    [heightValue]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          { height: windowHeight, top: windowHeight },
          style,
          animatedStyle,
          { paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.line} />
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const createStyles = (tokens: ThemeTokens) => StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: tokens.surface,
    position: "absolute",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    // The design-system lift, cast upward (the sheet rises from the bottom).
    ...elevation.lg,
    shadowOffset: { width: 0, height: -elevation.lg.shadowOffset.height },
    zIndex: 1000,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: tokens.border,
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: radius.pill,
  },
});
