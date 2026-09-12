import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support.styles";
import type { FAQItem } from "../faqs";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Expand-one-at-a-time list of frequently asked questions. */
export function FaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <Box style={styles.faqList}>
      {faqs.map((faq, idx) => {
        const isExpanded = expanded === idx;
        return (
          <Box key={idx} style={styles.faqCard}>
            <Touchable
              style={styles.faqHeader}
              activeOpacity={0.7}
              onPress={() => setExpanded(isExpanded ? null : idx)}
            >
              <AppText style={styles.faqQuestion}>{faq.question}</AppText>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </Touchable>
            {isExpanded && (
              <Box style={styles.faqBody}>
                <AppText style={styles.faqAnswer}>{faq.answer}</AppText>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
