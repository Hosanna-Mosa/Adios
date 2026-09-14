import { useEffect, useMemo, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { customFetch } from "@/utils/api/custom-fetch";
import { createStyles } from "../tracking.styles";

// Moved out of app/tracking.tsx unchanged. Single-feature for now: promote to
// components/ui/ or components/shared/ if a second feature needs it.

export function OrderReviewCard({
  orderId,
  isRide,
  isHelper,
  tokens,
  accent,
}: {
  orderId: string;
  isRide: boolean;
  isHelper: boolean;
  tokens: ThemeTokens;
  accent: ThemeTokens["services"]["food"];
}) {
  const styles = useMemo(() => createStyles(tokens, accent), [tokens, accent]);
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  // Not in the module-level constants inventory (defined inline here, not as
  // a module const), but the same "freeform review tag, safe to translate"
  // reasoning as orders.tsx's REVIEW_TAGS applies.
  const availableTags = useMemo(() => (isRide
    ? [t("app.ride.reviewTags.onTime"), t("app.ride.reviewTags.smoothRide"), t("app.ride.reviewTags.politeCaptain"), t("app.ride.reviewTags.cleanVehicle"), t("app.ride.reviewTags.greatRoute")]
    : isHelper
      ? [t("app.ride.reviewTags.onTime"), t("app.ride.reviewTags.carefulWithItems"), t("app.ride.reviewTags.polite"), t("app.ride.reviewTags.hardWorking")]
      : [t("app.ride.reviewTags.fastDelivery"), t("app.ride.reviewTags.freshAndHot"), t("app.ride.reviewTags.wellPackaged"), t("app.ride.reviewTags.friendlyPartner")]
  ), [isRide, isHelper, t]);

  useEffect(() => {
    if (!orderId) return;
    customFetch<any>(`/reviews/order/${orderId}`)
      .then((res) => {
        if (res && res.review) {
          setIsSubmitted(true);
          setExistingReview(res.review);
        }
      })
      .catch(() => {});
  }, [orderId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    if (!orderId) return;
    try {
      setIsSubmitting(true);
      const res = await customFetch<any>("/reviews", {
        method: "POST",
        body: JSON.stringify({ orderId, rating, comment, tags: selectedTags }),
      });
      if (res) {
        setIsSubmitted(true);
        setExistingReview(res.review || { rating, comment, tags: selectedTags });
      }
    } catch (err: any) {
      Alert.alert(t("app.ride.couldntSubmit"), err.message || t("app.ride.pleaseTryAgain"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && existingReview) {
    return (
      <View style={styles.reviewCard}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.reviewTitle}>{t("app.ride.yourFeedback")}</Text>
          <View style={styles.submittedPill}>
            <Ionicons name="checkmark" size={12} color={tokens.success} />
            <Text style={[styles.submittedPillText, { color: tokens.success }]}>{t("app.ride.submitted")}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={20} color={star <= existingReview.rating ? "#F59E0B" : tokens.border} />
          ))}
        </View>
        {existingReview.tags?.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {existingReview.tags.map((tag: string, idx: number) => (
              <View key={idx} style={[styles.reviewTagChip, { backgroundColor: accent.skin }]}>
                <Text style={[styles.reviewTagChipText, { color: accent.accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {existingReview.comment ? <Text style={styles.reviewComment}>{t("app.ride.quot")}{existingReview.comment}{t("app.ride.quot")}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.reviewCard}>
      <Text style={[styles.reviewTitle, { alignSelf: "center" }]}>{t("app.ride.rateYourExperience")}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 12, alignSelf: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
            <Ionicons name="star" size={32} color={star <= rating ? "#F59E0B" : tokens.border} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: "center" }}>
        {availableTags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.reviewTagChip, { backgroundColor: selected ? accent.skin : tokens.surface, borderWidth: 1, borderColor: selected ? accent.accent : tokens.borderStrong }]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.reviewTagChipText, { color: selected ? accent.accent : tokens.sec }]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        style={styles.reviewCommentInput}
        placeholder={t("app.ride.writeACommentOptional")}
        placeholderTextColor={tokens.muted}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <TouchableOpacity
        style={[styles.reviewSubmitBtn, { backgroundColor: accent.accent, opacity: isSubmitting ? 0.6 : 1 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={[styles.reviewSubmitBtnText, { color: accent.on }]}>{isSubmitting ? t("app.ride.submitting") : t("app.ride.submitRating")}</Text>
      </TouchableOpacity>
    </View>
  );
}
