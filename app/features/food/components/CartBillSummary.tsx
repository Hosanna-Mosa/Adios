import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
          <Text style={styles.couponTitle}>{appliedPromo ? `${appliedPromo.code} applied` : "Have a promo code?"}</Text>
          <Text style={styles.couponSub}>
            {appliedPromo ? `You saved ₹${Math.round(discount)}` : "Tap to add it at checkout"}
          </Text>
        </View>
        <Text style={styles.couponAction}>{appliedPromo ? "Remove" : "Apply"}</Text>
      </TouchableOpacity>

      {showPromoInput && !appliedPromo && (
        <View style={styles.promoInputRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter code"
            placeholderTextColor={tokens.muted}
            autoCapitalize="characters"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo} disabled={isApplyingPromo}>
            {isApplyingPromo ? <ActivityIndicator size="small" color={accent.on} /> : <Text style={styles.promoApplyBtnText}>Apply</Text>}
          </TouchableOpacity>
        </View>
      )}
      {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Bill summary</Text>
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item total</Text>
          <Text style={styles.billValue}>₹{subtotal}</Text>
        </View>
        {deliveryFee != null ? (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery fee</Text>
            <Text style={styles.billValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text>
          </View>
        ) : (
          <Text style={styles.billNote}>Delivery fee is confirmed at checkout.</Text>
        )}
        {appliedPromo && (
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: tokens.success }]}>Coupon {appliedPromo.code}</Text>
            <Text style={[styles.billValue, { color: tokens.success }]}>−₹{Math.round(discount)}</Text>
          </View>
        )}
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billTotalLabel}>To pay</Text>
          <Text style={styles.billTotalValue}>₹{total}</Text>
        </View>
      </View>
    </View>
    </>
  );
}
