import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Skeleton } from "./Skeleton";

interface Props {
  /** The card chrome, supplied by the feature — the two call sites disagree on
   *  padding, radius and cross-axis alignment. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Placeholder rows for a loading card.
 *
 * The rows sit in a full-width wrapper on purpose: the profile card centres its
 * children and the earnings card stretches them, so without a fixed width the
 * same placeholder renders differently in each. */
export function SkeletonCard({ style, testID }: Props) {
  return (
    <View style={style} testID={testID}>
      <View style={styles.rows}>
        <Skeleton width="100%" height={14} />
        <Skeleton width="60%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    width: "100%",
    gap: 10,
  },
});
