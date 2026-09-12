import React from "react";

import { styles } from "../chat.styles";
import { Touchable } from "@/components/ui/Touchable";
import { List } from "@/components/ui/List";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Horizontal row of canned replies above the composer. */
export function QuickReplyBar({
  replies,
  onSelect,
}: {
  replies: string[];
  onSelect: (reply: string) => void;
}) {
  return (
    <Box style={styles.quickRepliesContainer}>
      <List
        data={replies}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesList}
        renderItem={({ item }) => (
          <Touchable style={styles.quickReplyChip} onPress={() => onSelect(item)}>
            <AppText style={styles.quickReplyText}>{item}</AppText>
          </Touchable>
        )}
      />
    </Box>
  );
}
