import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { fontFamilies, typography } from "@/constants/typography";
import { usePaymentMethodStore } from "@/contexts/paymentMethodStore";

// How a ride is paid: straight to the captain, by cash or UPI, at the end of the trip. Nothing
// is charged in the app. The choice is remembered for this session and shown on the booking
// row; the server only needs to know the ride is paid to the captain (cash).

export type RidePayChoice = "gpay" | "phonepe" | "upi" | "pay_at_drop" | "cash";

interface ChoiceState {
  choice: RidePayChoice;
  setChoice: (c: RidePayChoice) => void;
}

export const useRidePayChoice = create<ChoiceState>((set) => ({
  choice: "pay_at_drop",
  setChoice: (choice) => set({ choice }),
}));

const ms = moderateScale;

function labelOf(choice: RidePayChoice, t: (k: string, d: string) => string) {
  switch (choice) {
    case "gpay": return t("app.ridePay.gpay", "GPay");
    case "phonepe": return t("app.ridePay.phonepe", "PhonePe");
    case "upi": return t("app.ridePay.otherUpi", "Any UPI app");
    case "cash": return t("app.ridePay.cash", "Cash");
    default: return t("app.ridePay.payAtDrop", "Pay at drop");
  }
}

/** The "Pay at Drop ›" row on the booking sheet; tapping it opens the Payments sheet. */
export function RidePayRow({ total, insets, disabled }: { total: number; insets: EdgeInsets; disabled?: boolean }) {
  const { t } = useTranslation();
  const tokens = designTokens[useThemeStore((st) => st.theme)];
  const choice = useRidePayChoice((s) => s.choice);
  const [open, setOpen] = useState(false);
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  return (
    <>
      <Pressable style={s.row} onPress={() => setOpen(true)} disabled={disabled} accessibilityRole="button" accessibilityLabel={t("app.ridePay.title", "Payments")}>
        <Ionicons name={choice === "cash" ? "cash-outline" : "qr-code-outline"} size={ms(20)} color={tokens.text} />
        <Text style={s.rowText}>{labelOf(choice, t as any)}</Text>
        <Ionicons name="chevron-forward" size={ms(16)} color={tokens.text} />
      </Pressable>
      <RidePaymentSheet visible={open} onClose={() => setOpen(false)} total={total} insets={insets} tokens={tokens} />
    </>
  );
}

function RidePaymentSheet({ visible, onClose, total, insets, tokens }: { visible: boolean; onClose: () => void; total: number; insets: EdgeInsets; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const choice = useRidePayChoice((st) => st.choice);
  const setChoice = useRidePayChoice((st) => st.setChoice);
  const setMethod = usePaymentMethodStore((st) => st.setMethod);

  const pick = (c: RidePayChoice) => {
    setChoice(c);
    // Every option here is paid to the captain, which the server records as cash.
    setMethod("ride", "cash");
    onClose();
  };

  const Radio = ({ on }: { on: boolean }) => (
    <View style={[s.radio, on && s.radioOn]}>{on && <View style={s.radioDot} />}</View>
  );
  const Option = ({ id, icon, label, children }: { id: RidePayChoice; icon: keyof typeof Ionicons.glyphMap; label: string; children?: React.ReactNode }) => (
    <Pressable style={s.option} onPress={() => pick(id)} accessibilityRole="radio" accessibilityState={{ checked: choice === id }}>
      <View style={s.optionHead}>
        <Ionicons name={icon} size={ms(22)} color={tokens.text} />
        <Text style={s.optionText}>{label}</Text>
        <Radio on={choice === id} />
      </View>
      {children}
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("app.support.closeModal")} />
        <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={s.handle} />
          <View style={s.head}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
              <Ionicons name="arrow-back" size={ms(24)} color={tokens.text} />
            </Pressable>
            <Text style={s.title} accessibilityRole="header">{t("app.ridePay.title", "Payments")}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body}>
            <View style={s.fareRow}>
              <Text style={s.fareLabel}>{t("app.ridePay.totalFare", "Total Fare")}</Text>
              <Text style={s.fareValue}>₹{Math.round(total)}</Text>
            </View>
            <View style={s.dashed} />

            <View style={s.notice}>
              <Ionicons name="information-circle-outline" size={ms(18)} color="#9A6700" />
              <Text style={s.noticeText}>{t("app.ridePay.notice", "Pay directly to your Captain through cash or UPI.")}</Text>
            </View>

            <Text style={s.section}>{t("app.ridePay.upiSection", "Pay by any UPI app")}</Text>
            <View style={s.card}>
              <Option id="gpay" icon="logo-google" label={t("app.ridePay.gpay", "GPay")} />
              <View style={s.rule} />
              <Option id="phonepe" icon="phone-portrait-outline" label={t("app.ridePay.phonepe", "PhonePe")} />
              <View style={s.rule} />
              <Option id="upi" icon="apps-outline" label={t("app.ridePay.otherUpi", "Any UPI app")} />
            </View>

            <Text style={s.section}>{t("app.ridePay.payLater", "Pay Later")}</Text>
            <View style={s.card}>
              <Option id="pay_at_drop" icon="qr-code-outline" label={t("app.ridePay.payAtDrop", "Pay at drop")}>
                <View style={s.tip}>
                  <Ionicons name="pricetag" size={ms(14)} color={tokens.sec} />
                  <Text style={s.tipText}>{t("app.ridePay.payAtDropHint", "Go cashless, after ride pay by scanning QR code")}</Text>
                </View>
              </Option>
            </View>

            <Text style={s.section}>{t("app.ridePay.others", "Others")}</Text>
            <View style={s.card}>
              <Option id="cash" icon="cash-outline" label={t("app.ridePay.cash", "Cash")} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: ms(8), minHeight: ms(44), paddingHorizontal: ms(4) },
    rowText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.5)" },
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), maxHeight: "88%", paddingTop: ms(8) },
    handle: { alignSelf: "center", width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginBottom: ms(8) },
    head: { flexDirection: "row", alignItems: "center", gap: ms(16), paddingHorizontal: ms(18), paddingVertical: ms(10) },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    body: { paddingHorizontal: ms(18), paddingBottom: ms(12) },
    fareRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: ms(6) },
    fareLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    fareValue: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    dashed: { marginTop: ms(10), borderTopWidth: 1, borderStyle: "dashed", borderColor: tokens.border },
    notice: { flexDirection: "row", alignItems: "center", gap: ms(8), marginTop: ms(16), padding: ms(12), borderRadius: ms(12), borderWidth: 1, borderColor: "#E0B93A", backgroundColor: "#FFF8DC" },
    noticeText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: "#7A5A00" },
    section: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text, marginTop: ms(22), marginBottom: ms(10) },
    card: { borderRadius: ms(14), borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border, backgroundColor: tokens.surface },
    option: { paddingHorizontal: ms(14), paddingVertical: ms(14) },
    optionHead: { flexDirection: "row", alignItems: "center", gap: ms(12) },
    optionText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    rule: { height: StyleSheet.hairlineWidth, backgroundColor: tokens.border },
    radio: { width: ms(26), height: ms(26), borderRadius: ms(13), borderWidth: 2, borderColor: tokens.borderStrong, alignItems: "center", justifyContent: "center" },
    radioOn: { borderColor: tokens.brand },
    radioDot: { width: ms(14), height: ms(14), borderRadius: ms(7), backgroundColor: tokens.brand },
    tip: { flexDirection: "row", alignItems: "center", gap: ms(8), marginTop: ms(10), padding: ms(10), borderRadius: ms(10), backgroundColor: tokens.sunken },
    tipText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },
  });
