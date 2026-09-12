import React from "react";
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "@/features/orders/orders.styles";
import type { Order } from "@/types/models";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  REVIEW_TAGS: any[];
  handleSubmitReview: () => void;
  reviewComment: any;
  reviewRating: any;
  reviewTags: any[];
  selectedOrderForReview: Order;
  setReviewComment: React.Dispatch<React.SetStateAction<any>>;
  setReviewRating: React.Dispatch<React.SetStateAction<any>>;
  setReviewTags: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedOrderForReview: React.Dispatch<React.SetStateAction<any>>;
  styles: OrdersStyles;
  submittingReview: any;
  tokens: ThemeTokens;
}

export function OrderReviewSheet({
  REVIEW_TAGS,
  handleSubmitReview,
  reviewComment,
  reviewRating,
  reviewTags,
  selectedOrderForReview,
  setReviewComment,
  setReviewRating,
  setReviewTags,
  setSelectedOrderForReview,
  styles,
  submittingReview,
  tokens,
}: Props) {
  return (
    <Modal visible={!!selectedOrderForReview} transparent animationType="fade" onRequestClose={() => setSelectedOrderForReview(null)}>
      <View style={styles.reviewOverlay}>
        <View style={styles.reviewCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={styles.reviewTitle}>Rate your order</Text>
            <TouchableOpacity onPress={() => setSelectedOrderForReview(null)}><Ionicons name="close" size={20} color={tokens.sec} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                <Ionicons name={star <= reviewRating ? "star" : "star-outline"} size={moderateScale(30)} color={tokens.warning} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 12 }}>
            {REVIEW_TAGS.map((tag) => {
              const isSelected = reviewTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.reviewTagChip, isSelected && { backgroundColor: tokens.brand, borderColor: tokens.brand }]}
                  onPress={() => setReviewTags((prev) => (isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]))}
                >
                  <Text style={[styles.reviewTagText, isSelected && { color: tokens.onBrand }]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput style={styles.reviewInput} placeholder="Add feedback (optional)" placeholderTextColor={tokens.muted} value={reviewComment} onChangeText={setReviewComment} multiline />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16, width: "100%" }}>
            <TouchableOpacity style={styles.reviewCancelBtn} onPress={() => setSelectedOrderForReview(null)}>
              <Text style={styles.reviewCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.reviewSubmitBtn, { backgroundColor: tokens.brand }]} onPress={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? <ActivityIndicator size="small" color={tokens.onBrand} /> : <Text style={[styles.reviewSubmitBtnText, { color: tokens.onBrand }]}>Submit</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
