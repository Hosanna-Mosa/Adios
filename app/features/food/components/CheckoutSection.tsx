import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type CheckoutStyles } from "@/features/food/checkout.styles";

// Section of CheckoutBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  appliedPromo: any;
  applyCode: any;
  applyingCode: any;
  isApplyingPromo: boolean;
  offers: any[];
  promoCodeText: string;
  promoError: string | null;
  removeCode: any;
  setPromoCodeText: React.Dispatch<React.SetStateAction<any>>;
  setShowPromoInput: React.Dispatch<React.SetStateAction<any>>;
  showPromoInput: boolean;
  styles: CheckoutStyles;
  subtotal: number;
  tokens: ThemeTokens;
}

export function CheckoutSection({
  accent,
  appliedPromo,
  applyCode,
  applyingCode,
  isApplyingPromo,
  offers,
  promoCodeText,
  promoError,
  removeCode,
  setPromoCodeText,
  setShowPromoInput,
  showPromoInput,
  styles,
  subtotal,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(120)} style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.offersAmpCoupons")}</Text>
      {appliedPromo ? (
        <View style={[styles.couponOptionRow, { borderColor: accent.accent, backgroundColor: accent.skin }]}>
          <View style={styles.radioSelected}><View style={[styles.radioDot, { backgroundColor: accent.accent }]} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponCode}>{appliedPromo.code}</Text>
            <Text style={styles.couponDesc}>{t("app.food.youSaved", { amount: appliedPromo.discountAmount })}</Text>
          </View>
          <TouchableOpacity onPress={removeCode}>
            <Text style={styles.changeLink}>{t("app.food.remove")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {offers.map((offer) => {
            const locked = offer.isApplicable === false;
            return (
              <View key={offer.code} style={[styles.couponOptionRow, locked && styles.couponOptionRowLocked]}>
                <View style={styles.couponIconCircle}>
                  <Ionicons name="pricetag" size={moderateScale(15)} color={accent.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.couponCode}>{offer.code}</Text>
                  <Text style={styles.couponDesc}>{offer.title}</Text>
                  <Text style={styles.couponSaving}>
                    {locked
                      ? `Add ₹${Math.max(0, Math.round(offer.amountToUnlock ?? offer.minOrder - subtotal))} more to use this`
                      : `Saves ₹${offer.discountAmount} on this order`}
                  </Text>
                </View>
                <TouchableOpacity disabled={locked || isApplyingPromo} onPress={() => applyCode(offer.code)}>
                  {applyingCode === offer.code ? (
                    <ActivityIndicator size="small" color={accent.accent} />
                  ) : (
                    <Text style={[styles.changeLink, locked && { color: tokens.muted }]}>{t("app.food.apply")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

          {showPromoInput ? (
            <View style={styles.promoInputRow}>
              {/* Opened by "Add", so it takes focus and raises the keyboard straight away. */}
              <TextInput
                autoFocus
                style={styles.promoInput}
                placeholder={t("app.food.enterPromoCode")}
                placeholderTextColor={tokens.muted}
                autoCapitalize="characters"
                value={promoCodeText}
                onChangeText={setPromoCodeText}
              />
              <TouchableOpacity style={styles.promoApplyBtn} onPress={() => applyCode(promoCodeText)} disabled={isApplyingPromo}>
                {isApplyingPromo && !applyingCode ? (
                  <ActivityIndicator size="small" color={accent.on} />
                ) : (
                  <Text style={styles.promoApplyBtnText}>{t("app.food.apply")}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.couponOptionRow} activeOpacity={0.85} onPress={() => setShowPromoInput(true)}>
              <Ionicons name="pricetag-outline" size={moderateScale(18)} color={tokens.sec} />
              <Text style={[styles.couponCode, { flex: 1 }]}>{t("app.food.haveAPromoCode")}</Text>
              <Text style={styles.changeLink}>{t("app.food.add")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
    </Animated.View>
  );
}
