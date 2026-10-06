import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { IconButton } from "./IconButton";

interface Props {
  uri: string;
  onRemove?: () => void;
  removeLabel?: string;
  /** Small caption in the bottom-left corner, e.g. "Cover". */
  tag?: string;
}

/** A square photo thumbnail with an optional remove button. */
export function ImageTile({ uri, onRemove, removeLabel = "Remove", tag }: Props) {
  return (
    <View style={styles.tile}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
      {onRemove ? (
        <IconButton
          icon="close"
          size={26}
          color="#FFFFFF"
          background="rgba(0,0,0,0.6)"
          onPress={onRemove}
          accessibilityLabel={removeLabel}
          style={styles.remove}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: moderateScale(104), height: moderateScale(104), borderRadius: radius.md, overflow: "hidden", backgroundColor: "#00000010" },
  remove: { position: "absolute", top: 6, right: 6, borderWidth: 0 },
  tag: { position: "absolute", left: 6, bottom: 6, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: "#FFFFFF" },
});
