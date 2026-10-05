import React from "react";
import { FlatList, RefreshControl, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { staggerListItem } from "@/motion/presets";

interface Props<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactElement;
  refreshing: boolean;
  onRefresh: () => void;
  /** Space below the last item — the tab bar height on tab screens. */
  bottomInset: number;
  ListEmptyComponent?: React.ReactElement | null;
  ListFooterComponent?: React.ReactElement | null;
  /** Called as the end of the list scrolls into view — loads the next page. */
  onEndReached?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * The scrolling list every list screen uses: themed pull-to-refresh, 12dp gaps,
 * 16dp side padding and the staggered entrance from motion/presets.
 */
export function RefreshList<T>({
  data,
  keyExtractor,
  renderItem,
  refreshing,
  onRefresh,
  bottomInset,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  contentStyle,
}: Props<T>) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }, contentStyle]}
      ItemSeparatorComponent={Separator}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.brand} colors={[tokens.brand]} />}
      renderItem={({ item, index }) => <Animated.View entering={staggerListItem(index)}>{renderItem(item, index)}</Animated.View>}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent ? <View style={styles.footer}>{ListFooterComponent}</View> : null}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 12 },
  footer: { paddingTop: 12 },
});
