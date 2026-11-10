import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { shareRestaurant } from "@/utils/shareLink";
import { orderLines, placedAt, ratingOf, rupees, vendorOf } from "../orderDetailsData";

// A finished restaurant or meat order: who it was from (with a menu link and a ⋮ menu), the
// dishes, when it was placed and how it ended, the total, and Reorder. A cancelled order
// says "Order cancelled" where a delivered one shows its date and "Delivered".

interface Props {
  order: any;
  tokens: ThemeTokens;
  delivered: boolean;
  cancelled: boolean;
  reordering: boolean;
  onReorder: () => void;
  onRate: () => void;
  onDelete: () => void;
}

const ms = moderateScale;

export function PastFoodOrderCard({ order, tokens, delivered, cancelled, reordering, onReorder, onRate, onDelete }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const vendor = vendorOf(order);
  const lines = orderLines(order);
  const rating = ratingOf(order);
  const dotRef = useRef<View>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const openDetails = () => router.push({ pathname: "/order-details", params: { orderId: order._id } });
  const openMenu = () => router.push({ pathname: "/restaurant-menu", params: { id: vendor.id, name: vendor.name, isMeat: order.__serviceKey === "meat" ? "true" : "false" } });

  const showMenu = () => {
    dotRef.current?.measureInWindow((x, y, w, h) => setMenu({ x: x + w, y: y + h }));
  };
  const closeMenu = () => setMenu(null);
  const confirmDelete = () => {
    closeMenu();
    Alert.alert(t("app.orders.deleteTitle", "Delete this order?"), t("app.orders.deleteBody", "It will be removed from your order history on this device."), [
      { text: t("actions.cancel", "Cancel"), style: "cancel" },
      { text: t("app.orders.delete", "Delete"), style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.thumb}>
          {vendor.image ? <Image source={{ uri: vendor.image }} style={s.thumbImg} contentFit="cover" transition={150} /> : <Ionicons name="storefront-outline" size={ms(22)} color={tokens.brand} />}
        </View>
        <View style={s.headText}>
          <Text style={s.name} numberOfLines={1}>{vendor.name || t("app.orders.orderFallback", "Order")}</Text>
          {!!vendor.address && <Text style={s.address} numberOfLines={1}>{vendor.address}</Text>}
          {!!vendor.id && (
            <Pressable onPress={openMenu} hitSlop={6} accessibilityRole="link">
              <Text style={s.link}>{t("app.orders.viewMenu", "View menu")} ▸</Text>
            </Pressable>
          )}
        </View>
        <View ref={dotRef} collapsable={false}>
          <Pressable onPress={showMenu} hitSlop={10} style={s.dots} accessibilityRole="button" accessibilityLabel={t("app.orders.moreOptions", "More options")}>
            <Ionicons name="ellipsis-vertical" size={ms(18)} color={tokens.text} />
          </Pressable>
        </View>
      </View>

      <View style={s.rule} />

      <View style={s.items}>
        {lines.slice(0, 4).map((l, i) => (
          <View key={`${l.name}-${i}`} style={s.itemRow}>
            <View style={[s.diet, { borderColor: l.isVeg ? tokens.veg : tokens.nonveg }]}>
              {l.isVeg ? <View style={[s.vegDot, { backgroundColor: tokens.veg }]} /> : <View style={[s.nonvegTri, { borderBottomColor: tokens.nonveg }]} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemText} numberOfLines={2}>{l.quantity} x {l.name}</Text>
              {!!l.sub && <Text style={s.itemSub}>{l.sub}</Text>}
            </View>
          </View>
        ))}
        {lines.length > 4 && <Text style={s.itemSub}>+{lines.length - 4} {t("app.orders.moreItems", "more")}</Text>}
      </View>

      <View style={s.dashed} />

      <Pressable style={s.statusRow} onPress={openDetails} accessibilityRole="button">
        <View style={{ flex: 1 }}>
          {cancelled ? (
            <>
              <Text style={s.cancelled}>{t("app.orders.orderCancelled", "Order cancelled")}</Text>
              <Text style={s.placed}>{placedAt(order.createdAt)}</Text>
            </>
          ) : (
            <>
              <Text style={s.placed}>{t("app.orders.orderPlacedOn", "Order placed on")} {placedAt(order.createdAt)}</Text>
              <Text style={s.state}>{delivered ? t("app.orders.delivered", "Delivered") : t("app.orders.completed", "Completed")}</Text>
            </>
          )}
        </View>
        <Text style={s.price}>{rupees(Number(order.totalPrice) || 0)}</Text>
        <Ionicons name="chevron-forward" size={ms(14)} color={tokens.sec} />
      </Pressable>

      <View style={s.rule} />

      <View style={s.footer}>
        <View style={{ flex: 1 }}>
          {delivered && rating ? (
            <>
              <Text style={s.rated}>{t("app.orders.youRated", "You rated")}  {rating} <Text style={{ color: "#F5A524" }}>★</Text></Text>
              <Pressable onPress={onRate} hitSlop={6}><Text style={s.link}>{t("app.orders.viewFeedback", "View your feedback")} ▸</Text></Pressable>
            </>
          ) : delivered && !order.isReviewed ? (
            <Pressable onPress={onRate} hitSlop={6}><Text style={s.link}>{t("app.orders.rateOrder", "Rate this order")} ▸</Text></Pressable>
          ) : null}
        </View>
        <Pressable style={s.reorder} onPress={onReorder} disabled={reordering} accessibilityRole="button">
          {reordering ? (
            <ActivityIndicator size="small" color={tokens.onBrand} />
          ) : (
            <>
              <Ionicons name="refresh" size={ms(16)} color={tokens.onBrand} />
              <Text style={s.reorderText}>{t("app.orders.reorder", "Reorder")}</Text>
            </>
          )}
        </Pressable>
      </View>

      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={closeMenu} statusBarTranslucent>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} accessibilityLabel={t("app.support.closeModal")} />
        {menu && (
          <View style={[s.popup, { top: menu.y + 4, right: Math.max(12, 0) }]}>
            <MenuRow icon="arrow-redo-outline" label={t("app.orders.shareRestaurant", "Share restaurant")} s={s} tokens={tokens} onPress={() => { closeMenu(); shareRestaurant(vendor.id, vendor.name); }} />
            <MenuRow icon="receipt-outline" label={t("app.orders.orderDetails", "Order details")} s={s} tokens={tokens} onPress={() => { closeMenu(); openDetails(); }} />
            <MenuRow icon="trash-outline" label={t("app.orders.deleteThisOrder", "Delete this order")} s={s} tokens={tokens} onPress={confirmDelete} />
          </View>
        )}
      </Modal>
    </View>
  );
}

function MenuRow({ icon, label, onPress, s, tokens }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; s: ReturnType<typeof makeStyles>; tokens: ThemeTokens }) {
  return (
    <Pressable style={s.popRow} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={ms(18)} color={tokens.text} />
      <Text style={s.popText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { backgroundColor: tokens.surface, borderRadius: ms(16), marginHorizontal: 12, marginBottom: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border, paddingBottom: ms(14), shadowColor: "#171717", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    head: { flexDirection: "row", alignItems: "flex-start", gap: ms(12), padding: ms(14) },
    thumb: { width: ms(52), height: ms(52), borderRadius: ms(10), overflow: "hidden", backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center" },
    thumbImg: { width: "100%", height: "100%" },
    headText: { flex: 1, minWidth: 0 },
    name: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    address: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    link: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.small, color: tokens.brand, marginTop: 2 },
    dots: { padding: ms(4) },
    rule: { height: StyleSheet.hairlineWidth, backgroundColor: tokens.border, marginHorizontal: ms(14) },
    items: { paddingHorizontal: ms(14), paddingVertical: ms(12), gap: ms(10) },
    itemRow: { flexDirection: "row", alignItems: "flex-start", gap: ms(10) },
    diet: { width: ms(16), height: ms(16), borderWidth: 1.5, borderRadius: 3, alignItems: "center", justifyContent: "center", marginTop: 2 },
    vegDot: { width: ms(8), height: ms(8), borderRadius: ms(4) },
    nonvegTri: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 7, borderLeftColor: "transparent", borderRightColor: "transparent" },
    itemText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
    itemSub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },
    dashed: { marginHorizontal: ms(14), borderTopWidth: 1, borderStyle: "dashed", borderColor: tokens.border },
    statusRow: { flexDirection: "row", alignItems: "center", gap: ms(6), paddingHorizontal: ms(14), paddingVertical: ms(12) },
    placed: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },
    state: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, marginTop: ms(8) },
    cancelled: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.error },
    price: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    footer: { flexDirection: "row", alignItems: "center", gap: ms(12), paddingHorizontal: ms(14), paddingTop: ms(12) },
    rated: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    reorder: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: ms(6), minWidth: ms(112), minHeight: ms(44), paddingHorizontal: ms(18), borderRadius: ms(10), backgroundColor: tokens.brand },
    reorderText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.onBrand },
    popup: { position: "absolute", backgroundColor: tokens.surface, borderRadius: ms(12), paddingVertical: ms(6), minWidth: ms(200), shadowColor: "#171717", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
    popRow: { flexDirection: "row", alignItems: "center", gap: ms(12), paddingHorizontal: ms(16), minHeight: ms(44) },
    popText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text },
  });
