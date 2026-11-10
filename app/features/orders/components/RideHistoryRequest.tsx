import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { requestRideHistory } from "@/services/orders.service";

// Under the ride orders: "Looking for rides older than 90 days?" with a button that opens a
// small sheet asking for a date range and an email; the history is emailed to that address.

const ms = moderateScale;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const show = (d: Date | null) => (d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");

export function RideHistoryRequest({ tokens }: { tokens: ThemeTokens }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const user = useAuthStore((st) => st.user);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [email, setEmail] = useState(user?.email ?? "");
  const [sending, setSending] = useState(false);
  const [iosPicker, setIosPicker] = useState<"from" | "to" | null>(null);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = !!from && !!to && from <= to && emailOk;

  const pick = (which: "from" | "to") => {
    const current = (which === "from" ? from : to) ?? new Date();
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current, mode: "date", maximumDate: new Date(),
        onChange: (_e, d) => { if (d) (which === "from" ? setFrom : setTo)(d); },
      });
    } else {
      setIosPicker(which);
    }
  };

  const submit = async () => {
    if (!valid || !from || !to) return;
    setSending(true);
    try {
      const res = await requestRideHistory({ from: iso(from), to: iso(to), email: email.trim() });
      setOpen(false);
      showAlert(
        t("app.orders.historyRequested", "Request sent"),
        t("app.orders.historyRequestedBody", { count: res.count, email: email.trim(), defaultValue: "We've emailed {{count}} ride(s) to {{email}}." }),
      );
    } catch (e: any) {
      showAlert(t("app.orders.historyFailed", "Couldn't send your history"), e?.message || t("app.ride.pleaseTryAgain"), undefined, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <View style={s.footer}>
        <View style={s.footerRow}>
          <Ionicons name="help-circle-outline" size={ms(22)} color={tokens.text} />
          <Text style={s.footerText}>{t("app.orders.olderRides", "Looking for rides older than 90 days?")}</Text>
        </View>
        <Pressable style={s.footerBtn} onPress={() => setOpen(true)} accessibilityRole="button">
          <Text style={s.footerBtnText}>{t("app.orders.requestRideHistory", "Request Ride History")}</Text>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel={t("app.support.closeModal")} />
          <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
            <View style={s.handle} />
            <Text style={s.title} accessibilityRole="header">{t("app.orders.requestDuration", "Request details duration")}</Text>

            <Text style={s.label}>{t("app.orders.fromDate", "From date")}</Text>
            <Pressable style={s.field} onPress={() => pick("from")} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={ms(20)} color={tokens.sec} />
              <Text style={[s.fieldText, !from && { color: tokens.muted }]}>{from ? show(from) : t("app.orders.selectDate", "Select date")}</Text>
            </Pressable>

            <Text style={s.label}>{t("app.orders.toDate", "To date")}</Text>
            <Pressable style={s.field} onPress={() => pick("to")} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={ms(20)} color={tokens.sec} />
              <Text style={[s.fieldText, !to && { color: tokens.muted }]}>{to ? show(to) : t("app.orders.selectDate", "Select date")}</Text>
            </Pressable>

            <Text style={s.label}>{t("app.orders.yourEmail", "Your email")}</Text>
            <View style={s.field}>
              <Ionicons name="mail-outline" size={ms(20)} color={tokens.sec} />
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@abc.com"
                placeholderTextColor={tokens.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t("app.orders.yourEmail", "Your email")}
              />
            </View>

            {!!from && !!to && from > to && <Text style={s.error}>{t("app.orders.rangeOrder", "The from date must be before the to date.")}</Text>}

            <Pressable
              style={[s.cta, { backgroundColor: valid ? tokens.brand : tokens.brandSkin }]}
              onPress={submit}
              disabled={!valid || sending}
              accessibilityRole="button"
              accessibilityState={{ disabled: !valid || sending, busy: sending }}
            >
              {sending ? <ActivityIndicator color={tokens.onBrand} /> : <Text style={[s.ctaText, { color: valid ? tokens.onBrand : tokens.muted }]}>{t("app.orders.requestRideHistory", "Request Ride History")}</Text>}
            </Pressable>
          </View>
        </View>

        {Platform.OS === "ios" && iosPicker && (
          <Modal transparent animationType="fade" onRequestClose={() => setIosPicker(null)}>
            <Pressable style={s.pickerBackdrop} onPress={() => setIosPicker(null)}>
              <View style={s.pickerCard}>
                <DateTimePicker
                  value={(iosPicker === "from" ? from : to) ?? new Date()}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_e, d) => { if (d) (iosPicker === "from" ? setFrom : setTo)(d); }}
                />
                <Pressable style={s.pickerDone} onPress={() => setIosPicker(null)} accessibilityRole="button">
                  <Text style={s.pickerDoneText}>{t("actions.done", "Done")}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        )}
      </Modal>
    </>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    footer: { marginHorizontal: ms(12), marginTop: ms(4), marginBottom: ms(16), padding: ms(16), borderRadius: ms(16), backgroundColor: tokens.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border },
    footerRow: { flexDirection: "row", alignItems: "center", gap: ms(10) },
    footerText: { flex: 1, fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    footerBtn: { alignSelf: "flex-end", marginTop: ms(14), paddingHorizontal: ms(16), minHeight: ms(44), borderRadius: ms(22), borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    footerBtnText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.text },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.5)" },
    sheet: { backgroundColor: tokens.surface, borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingHorizontal: ms(18), paddingTop: ms(8) },
    handle: { alignSelf: "center", width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginBottom: ms(14) },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text },
    label: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, letterSpacing: 0.6, textTransform: "uppercase", color: tokens.sec, marginTop: ms(16), marginBottom: ms(8) },
    field: { flexDirection: "row", alignItems: "center", gap: ms(10), minHeight: ms(50), paddingHorizontal: ms(14), borderRadius: ms(10), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface },
    fieldText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text },
    input: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, color: tokens.text, paddingVertical: 0 },
    error: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.error, marginTop: ms(8) },
    cta: { marginTop: ms(22), minHeight: ms(52), borderRadius: ms(26), alignItems: "center", justifyContent: "center" },
    ctaText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium },
    pickerBackdrop: { flex: 1, justifyContent: "center", paddingHorizontal: ms(24), backgroundColor: "rgba(23,23,23,0.5)" },
    pickerCard: { backgroundColor: tokens.surface, borderRadius: ms(16), padding: ms(12) },
    pickerDone: { alignSelf: "flex-end", paddingHorizontal: ms(18), paddingVertical: ms(10) },
    pickerDoneText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.brand },
  });
