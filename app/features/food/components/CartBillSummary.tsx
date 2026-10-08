import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type CartStyles } from "@/features/food/cart.styles";

// Section of CartContents, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  accent: ServiceTokens;
  appliedPromo: any;
  deliveryFee: number | null;
  discount: number;
  handleApplyPromo: () => void;
  isApplyingPromo: boolean;
  promoCode: any;
  promoError: string | null;
  setAppliedPromo: React.Dispatch<React.SetStateAction<any>>;
  setPromoCode: React.Dispatch<React.SetStateAction<any>>;
  setShowPromoInput: React.Dispatch<React.SetStateAction<boolean>>;
  showPromoInput: boolean;
  styles: CartStyles;
  subtotal: number;
  tokens: ThemeTokens;
  total: number;
}

export function CartBillSummary({
  accent,
  appliedPromo,
  deliveryFee,
  discount,
  handleApplyPromo,
  isApplyingPromo,
  promoCode,
  promoError,
  setAppliedPromo,
  setPromoCode,
  setShowPromoInput,
  showPromoInput,
  styles,
  subtotal,
  tokens,
  total,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.couponRow}
        activeOpacity={0.85}
        onPress={() => (appliedPromo ? setAppliedPromo(null) : setShowPromoInput((s) => !s))}
      >
        <View style={styles.couponIconCircle}>
          <Ionicons name="pricetag" size={moderateScale(15)} color={accent.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.couponTitle}>{appliedPromo ? t("app.food.codeApplied", { code: appliedPromo.code, defaultValue: "{{code}} applied" }) : t("app.food.haveAPromoCode")}</Text>
          {appliedPromo && (
            <Text style={styles.couponSub}>
              {t("app.food.youSaved", { amount: Math.round(discount), defaultValue: "You saved ₹{{amount}}" })}
            </Text>
          )}
        </View>
        <Text style={styles.couponAction}>{appliedPromo ? t("app.food.remove") : t("app.food.apply")}</Text>
      </TouchableOpacity>

      {showPromoInput && !appliedPromo && (
        <View style={styles.promoInputRow}>
          {/* Opened by "Apply", so it takes focus and raises the keyboard straight away. */}
          <TextInput
            autoFocus
            style={styles.promoInput}
            placeholder={t("app.food.enterCode")}
            placeholderTextColor={tokens.muted}
            autoCapitalize="characters"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo} disabled={isApplyingPromo}>
            {isApplyingPromo ? <ActivityIndicator size="small" color={accent.on} /> : <Text style={styles.promoApplyBtnText}>{t("app.food.apply")}</Text>}
          </TouchableOpacity>
        </View>
      )}
      {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.billSummary")}</Text>
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>{t("app.food.itemTotal")}</Text>
          <Text style={styles.billValue}>₹{subtotal}</Text>
        </View>
        {deliveryFee != null ? (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t("app.food.deliveryFee")}</Text>
            <Text style={styles.billValue}>{deliveryFee === 0 ? t("app.food.free") : `₹${deliveryFee}`}</Text>
          </View>
        ) : (
          <Text style={styles.billNote}>{t("app.food.deliveryFeeIsConfirmedAtCheckout")}</Text>
        )}
        {appliedPromo && (
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: tokens.success }]}>{t("app.food.coupon")} {appliedPromo.code}</Text>
            <Text style={[styles.billValue, { color: tokens.success }]}>−₹{Math.round(discount)}</Text>
          </View>
        )}
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billTotalLabel}>{t("app.food.toPay")}</Text>
          <Text style={styles.billTotalValue}>₹{total}</Text>
        </View>
      </View>
    </View>
    </>
  );
}
