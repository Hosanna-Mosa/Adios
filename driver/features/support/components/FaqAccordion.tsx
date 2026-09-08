import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support.styles";
import type { FAQItem } from "../faqs";

/** Expand-one-at-a-time list of frequently asked questions. */
export function FaqAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.faqList}>
      {faqs.map((faq, idx) => {
        const isExpanded = expanded === idx;
        return (
          <View key={idx} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              activeOpacity={0.7}
              onPress={() => setExpanded(isExpanded ? null : idx)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.faqBody}>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
