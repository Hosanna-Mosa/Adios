import { useEffect, useRef, useState } from "react";
import { Animated, Easing, type StyleProp, type TextStyle } from "react-native";

interface Props {
  /** At least two lines; one is shown at a time. */
  phrases: string[];
  style?: StyleProp<TextStyle>;
  /** How long each line stays, in ms. */
  intervalMs?: number;
}

/**
 * Search-bar hint that changes every couple of seconds: the current line slides
 * up and fades out, the next one rises in from below.
 */
export function RotatingPlaceholder({ phrases, style, intervalMs = 2000 }: Props) {
  const [index, setIndex] = useState(0);
  const progress = useRef(new Animated.Value(1)).current;
  const count = phrases.length;
  const phrasesKey = phrases.join("|");

  // A different list (Food <-> Meat, or a language change) starts again from its first line.
  useEffect(() => {
    setIndex(0);
    progress.setValue(1);
  }, [phrasesKey, progress]);

  useEffect(() => {
    if (count < 2) return;
    let cancelled = false;
    const timer = setInterval(() => {
      Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
        if (cancelled) return;
        setIndex((i) => (i + 1) % count);
        progress.setValue(-1);
        Animated.timing(progress, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      });
    }, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [count, intervalMs, progress]);

  // progress: 1 = resting, 0 = gone upward, -1 = waiting below.
  const opacity = progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0, 1] });
  const translateY = progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [10, -10, 0] });

  return (
    // flex: 0 so the text keeps its own height and the parent can centre it vertically.
    <Animated.Text style={[style, { flex: 0, opacity, transform: [{ translateY }] }]} numberOfLines={1}>
      {phrases[index % Math.max(count, 1)]}
    </Animated.Text>
  );
}
