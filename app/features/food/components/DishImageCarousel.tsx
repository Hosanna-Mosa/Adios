import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";

interface Props {
  images?: (string | null | undefined)[];
  /** Height, background and radius of each photo — the sheet's own image style. */
  imageStyle: any;
  /** Colour of the dot for the photo on screen. */
  activeColor: string;
}

/**
 * A dish's photos, swiped sideways one at a time, with a dot per photo. The
 * sheet used to show only the first image even when a dish had several.
 * Spans the window width, which is the dish sheet's width.
 */
export function DishImageCarousel({ images, imageStyle, activeColor }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const photos = useMemo(() => {
    const unique = Array.from(new Set((images ?? []).filter((uri): uri is string => typeof uri === "string" && !!uri.trim())));
    // No photo: one empty slot, which shows the image style's own background.
    return unique.length > 0 ? unique : [""];
  }, [images]);

  return (
    <View>
      <FlatList
        data={photos}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        scrollEnabled={photos.length > 1}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <Image source={item ? { uri: item } : null} style={[imageStyle, { width }]} contentFit="cover" transition={200} />
        )}
      />
      {photos.length > 1 && (
        <View style={styles.dotsWrap} pointerEvents="none">
          <View style={styles.dots}>
            {photos.map((uri, i) => (
              <View key={`${i}-${uri}`} style={[styles.dot, i === index && [styles.dotActive, { backgroundColor: activeColor }]]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsWrap: { position: "absolute", left: 0, right: 0, bottom: 12, alignItems: "center" },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.7)" },
  dotActive: { width: 16 },
});
