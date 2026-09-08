import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../chat.styles";

/** Horizontal row of canned replies above the composer. */
export function QuickReplyBar({
  replies,
  onSelect,
}: {
  replies: string[];
  onSelect: (reply: string) => void;
}) {
  return (
    <View style={styles.quickRepliesContainer}>
      <FlatList
        data={replies}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.quickReplyChip} onPress={() => onSelect(item)}>
            <Text style={styles.quickReplyText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
