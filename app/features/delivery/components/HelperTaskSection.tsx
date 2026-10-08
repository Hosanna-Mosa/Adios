import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type HelperTaskStyles } from "../helper-task.styles";
import type { HelperQuote } from "@/services/orders.service";
import { clampOffer } from "../useHelperTask.shared";

// The −/+ ₹20 steppers of the offer step. They stay inside the range the server
// accepts for this quote (minOffer…maxOffer), so the offer can't be stepped to
// something POST /orders would refuse.

const STEP = 20;

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  offer: number | null;
  quote: HelperQuote | null;
  setOffer: React.Dispatch<React.SetStateAction<number | null>>;
  styles: HelperTaskStyles;
}

export function HelperTaskSection({
  accent,
  calculatedFare,
  offer,
  quote,
  setOffer,
  styles,
}: Props) {
  const { t } = useTranslation();
  const current = offer ?? calculatedFare;
  const atMin = !!quote && current <= quote.minOffer;
  const atMax = !!quote && current >= quote.maxOffer;
  return (
    <Animated.View style={styles.section} entering={fadeInUp(80)}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity
          style={[styles.offerStepBtn, atMin && { opacity: 0.4 }]}
          disabled={atMin}
          onPress={() => setOffer((o) => clampOffer((o ?? calculatedFare) - STEP, quote))}
        >
          <Text style={styles.offerStepBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.offerStepsMid}>
          <Text style={styles.offerStepsMidText}>{t("app.delivery.20Steps")}</Text>
        </View>
        <TouchableOpacity
          style={[styles.offerStepBtn, { backgroundColor: accent.accent, borderWidth: 0 }, atMax && { opacity: 0.4 }]}
          disabled={atMax}
          onPress={() => setOffer((o) => clampOffer((o ?? calculatedFare) + STEP, quote))}
        >
          <Text style={[styles.offerStepBtnText, { color: accent.on }]}>+</Text>
        </TouchableOpacity>
      </View>
      {quote && (
        <Text style={[styles.descHint, { textAlign: "center" }]}>
          {t("app.delivery.offerRange", { min: quote.minOffer, max: quote.maxOffer })}
        </Text>
      )}
    </Animated.View>
  );
}
