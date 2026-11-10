import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { MapBackground, type MapBackgroundRef } from "@/components/MapBackground";
import { showAlert } from "@/components/ui/AppAlert";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useThemeStore } from "@/contexts/themeStore";
import { checkZone, getPlaceDetails, reverseGeocode, searchPlacesJsonBiased } from "@/services/places.service";
import { getRecentLocations } from "@/services/users.service";
import { RideAllServicesSheet, type RideVehicle } from "./RideAllServicesSheet";

// The ride home: the map with the pickup point, and a sheet that opens over it. The sheet holds
// the "Where are you going?" search, recent places, popular places and an Explore row. Drag
// the top of the sheet down to see more of the map, up to bring the list back.

const ms = moderateScale;
const FAV_KEY = "ride:favourite-places";
const POPULAR = [
  { key: "bus", query: "Bus stand", label: "Bus Stand", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&q=70" },
  { key: "rail", query: "Railway station", label: "Railway station", image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=480&q=70" },
];

type Place = { id: string; name: string; address: string; lat: number; lng: number };

export function RideHomeBody() {
  const { t } = useTranslation();
  const tokens = designTokens[useThemeStore((st) => st.theme)];
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const coords = useDeliveryStore((st) => st.currentCoords);
  const pickupLabel = useDeliveryStore((st) => st.currentLocation);

  const mapRef = useRef<MapBackgroundRef>(null);
  // The map is centred once on where the phone is, then left alone: feeding it every pickup
  // change would pull it back to the pin position while the user is dragging.
  const [mapAnchor, setMapAnchor] = useState(coords);
  const ignoreSettleUntil = useRef(0);
  const geocodeId = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pinH, setPinH] = useState(ms(80));

  const [recents, setRecents] = useState<Place[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [allOpen, setAllOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const vehicles: RideVehicle[] = useMemo(
    () => [
      { id: "bike", name: t("app.rideTierNames.bike"), icon: "motorbike" },
      { id: "auto", name: t("app.rideTierNames.auto"), icon: "rickshaw" },
    ],
    [t],
  );

  // ---- the sheet: two resting heights, TOP (list) and MID (map showing) ----
  const TOP = insets.top + ms(56);
  const MID = Math.round(height * 0.46);
  const sy = useSharedValue(TOP);
  const startY = useSharedValue(TOP);
  const snap = (to: number) => {
    "worklet";
    sy.value = withSpring(to, { damping: 22, stiffness: 220 });
  };
  const pan = Gesture.Pan()
    .onStart(() => { startY.value = sy.value; })
    .onUpdate((e) => { sy.value = Math.min(MID, Math.max(TOP, startY.value + e.translationY)); })
    .onEnd((e) => { snap(e.velocityY > 500 || sy.value > (TOP + MID) / 2 ? (e.velocityY < -500 ? TOP : MID) : TOP); });

  // The pickup pin stays at one spot on screen: the middle of the map the sheet leaves free when it
  // is at its lower resting height. The map moves under it, and the point under the pin is the pickup.
  const ANCHOR_Y = Math.round(MID / 2);
  const PIN_DOT = ms(22);
  const PILL_OFFSET = ms(60);
  const sheetStyle = useAnimatedStyle(() => ({ top: sy.value }));
  const pillStyle = useAnimatedStyle(() => ({
    top: sy.value - PILL_OFFSET,
    opacity: interpolate(sy.value, [TOP + 30, MID], [0, 1], Extrapolation.CLAMP),
  }));
  const pinStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sy.value, [TOP + 30, MID], [0, 1], Extrapolation.CLAMP),
  }));

  // First fix: centre the map so the phone's position sits under the pin, not under the sheet.
  useEffect(() => {
    if (!mapAnchor) return;
    // The map's own first move to the phone's position, and the shift below, are not the user dragging.
    ignoreSettleUntil.current = Date.now() + 3300;
    const timer = setTimeout(() => {
      const delta = 0.015;
      const shift = ((height / 2 - ANCHOR_Y) / height) * delta;
      ignoreSettleUntil.current = Date.now() + 1800;
      mapRef.current?.panTo(mapAnchor.lat - shift, mapAnchor.lng, delta);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapAnchor]);
  useEffect(() => {
    if (!mapAnchor && coords) setMapAnchor(coords);
  }, [coords, mapAnchor]);

  /** The map stopped moving: the pickup is now the point under the pin, and its address is looked up. */
  const onMapSettled = (r: { latitude: number; longitude: number; latitudeDelta: number }) => {
    if (Date.now() < ignoreSettleUntil.current) return;
    const lat = r.latitude + ((height / 2 - ANCHOR_Y) / height) * r.latitudeDelta;
    const lng = r.longitude;
    const store = useDeliveryStore.getState();
    store.setCurrentCoords({ lat, lng });
    store.setCurrentLocation(t("app.ride.detectingLocation", "Detecting your location…"));
    if (settleTimer.current) clearTimeout(settleTimer.current);
    const id = ++geocodeId.current;
    settleTimer.current = setTimeout(async () => {
      try {
        const res = await reverseGeocode(lat, lng);
        if (id !== geocodeId.current) return;
        const first = Array.isArray(res) ? res[0] : null;
        useDeliveryStore.getState().setCurrentLocation(first?.address || first?.name || t("app.ride.pinnedLocation", "Pinned location"));
      } catch {
        if (id === geocodeId.current) useDeliveryStore.getState().setCurrentLocation(t("app.ride.pinnedLocation", "Pinned location"));
      }
    }, 350);
  };
  useEffect(() => () => { if (settleTimer.current) clearTimeout(settleTimer.current); }, []);

  // ---- data ----
  useFocusEffect(
    useCallback(() => {
      let live = true;
      getRecentLocations()
        .then((list) => {
          if (!live || !Array.isArray(list)) return;
          setRecents(
            list
              .filter((r: any) => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)))
              .map((r: any, i: number) => ({
                id: String(r.id ?? r._id ?? `${r.lat},${r.lng}`),
                name: String(r.name || r.address || "").split(",")[0],
                address: String(r.address || r.fullAddress || r.name || ""),
                lat: Number(r.lat),
                lng: Number(r.lng),
              })),
          );
        })
        .catch(() => {});
      AsyncStorage.getItem(FAV_KEY).then((raw) => live && setFavs(raw ? JSON.parse(raw) : [])).catch(() => {});
      return () => { live = false; };
    }, []),
  );
  useEffect(() => {
    // The hero pill needs a location even if Home never resolved one.
    if (!coords) useDeliveryStore.getState().setCurrentLocation(t("app.ride.detectingLocation", "Detecting your location…"));
  }, [coords, t]);

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(next);
    AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch(() => {});
  };

  // ---- actions ----
  const startSearch = (serviceId: "bike" | "auto" = "bike") => {
    useDeliveryStore.getState().setServiceType(serviceId);
    router.push({ pathname: "/drop-location", params: { serviceId, name: serviceId === "auto" ? t("app.rideTierNames.auto") : t("app.rideTierNames.bike") } });
  };

  /** Goes straight to vehicle choice for a destination, checking the area is served first. */
  const rideTo = async (place: Place, key: string) => {
    if (!coords) {
      showAlert(t("app.ride.pickupNeeded", "Pickup needed"), t("app.ride.enableLocationForPickup", "Turn on your location so we know where to pick you up."));
      return;
    }
    setBusyKey(key);
    try {
      const zone = await checkZone(place.lat, place.lng).catch(() => null);
      if (zone && zone.inZone === false) {
        showAlert(t("app.ride.noService", "No Service"), t("app.ride.noServiceAtDrop", "We don't serve that drop location yet."));
        return;
      }
      useDeliveryStore.getState().setServiceType("bike");
      router.push({
        pathname: "/ride-confirmation",
        params: {
          serviceId: "bike",
          pickupName: pickupLabel,
          dropName: place.address || place.name,
          pickupLat: String(coords.lat),
          pickupLng: String(coords.lng),
          dropLat: String(place.lat),
          dropLng: String(place.lng),
          stops: "[]",
          bookingForType: "myself",
        },
      });
    } finally {
      setBusyKey(null);
    }
  };

  const openPopular = async (p: (typeof POPULAR)[number]) => {
    setBusyKey(p.key);
    try {
      const bias = coords ? `&lat=${coords.lat}&lng=${coords.lng}` : "";
      const found = await searchPlacesJsonBiased(p.query, bias);
      const first = Array.isArray(found) ? found[0] : null;
      const details: any = first?.place_id ? await getPlaceDetails<any>(first.place_id).catch(() => null) : null;
      const lat = Number(details?.lat ?? details?.geometry?.location?.lat);
      const lng = Number(details?.lng ?? details?.geometry?.location?.lng);
      if (!first || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        startSearch();
        return;
      }
      await rideTo({ id: first.place_id, name: first.structured_formatting?.main_text || p.label, address: first.description || p.label, lat, lng }, p.key);
    } finally {
      setBusyKey(null);
    }
  };

  const listRecents = recents.slice(0, 3);
  const gridPlaces = recents.slice(3, 9);

  return (
    <View style={s.root}>
      <MapBackground ref={mapRef} style={StyleSheet.absoluteFill} userLocation={mapAnchor} onRegionSettled={onMapSettled} hideZoomControls />

      {/* Pickup point, centred in the part of the map the sheet leaves free. */}
      <Animated.View style={[s.pin, { top: ANCHOR_Y - (pinH - PIN_DOT / 2) }, pinStyle]} pointerEvents="none" onLayout={(e) => setPinH(e.nativeEvent.layout.height)}>
        <View style={s.pinBubble}><Text style={s.pinText}>{t("app.ride.pickupPoint", "Pickup Point")}</Text></View>
        <View style={s.pinStem} />
        <View style={s.pinDot}><View style={s.pinDotInner} /></View>
      </Animated.View>
      <Animated.View style={[s.pill, pillStyle]} pointerEvents="none">
        <View style={s.pillDot} />
        <Text style={s.pillText} numberOfLines={1}>{pickupLabel}</Text>
      </Animated.View>

      <Pressable onPress={() => router.back()} hitSlop={10} style={[s.back, { top: insets.top + ms(8) }]} accessibilityRole="button" accessibilityLabel={t("app.a11y.goBack")}>
        <Ionicons name="arrow-back" size={ms(22)} color={tokens.text} />
      </Pressable>

      <Animated.View style={[s.sheet, sheetStyle]}>
        <GestureDetector gesture={pan}>
          <View collapsable={false}>
            <View style={s.handle} />
            <Pressable style={s.search} onPress={() => startSearch()} accessibilityRole="button" accessibilityLabel={t("app.ride.whereAreYouGoing", "Where are you going?")}>
              <View style={s.searchInner}>
                <Ionicons name="search" size={ms(22)} color={tokens.text} />
                <Text style={s.searchText}>{t("app.ride.whereAreYouGoing", "Where are you going?")}</Text>
              </View>
              <View style={s.mic}>
                <Ionicons name="mic" size={ms(18)} color={tokens.onBrand} />
                <Text style={s.micText}>{t("app.ride.speak", "Speak")}</Text>
              </View>
            </Pressable>
          </View>
        </GestureDetector>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {listRecents.map((p) => (
            <Pressable key={p.id} style={s.recentRow} onPress={() => rideTo(p, p.id)} accessibilityRole="button">
              <Ionicons name="time-outline" size={ms(22)} color={tokens.sec} />
              <View style={{ flex: 1 }}>
                <Text style={s.recentName} numberOfLines={1}>{p.name}</Text>
                <Text style={s.recentAddr} numberOfLines={1}>{p.address}</Text>
              </View>
              {busyKey === p.id ? (
                <ActivityIndicator size="small" color={tokens.brand} />
              ) : (
                <Pressable onPress={() => toggleFav(p.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("app.ride.favourite", "Favourite")}>
                  <Ionicons name={favs.includes(p.id) ? "heart" : "heart-outline"} size={ms(24)} color={favs.includes(p.id) ? tokens.brand : tokens.sec} />
                </Pressable>
              )}
            </Pressable>
          ))}

          {gridPlaces.length > 0 && (
            <View style={s.grid}>
              {gridPlaces.map((p) => (
                <Pressable key={p.id} style={s.gridCell} onPress={() => rideTo(p, p.id)} accessibilityRole="button">
                  <View style={s.gridIcon}><Ionicons name="location" size={ms(24)} color={tokens.brand} /></View>
                  <Text style={s.gridText} numberOfLines={2}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={s.section}>{t("app.ride.popularPlaces", "Popular Places")}</Text>
          <View style={s.popularRow}>
            {POPULAR.map((p) => (
              <Pressable key={p.key} style={s.popular} onPress={() => openPopular(p)} accessibilityRole="button" accessibilityLabel={p.label}>
                <View style={s.popularHead}>
                  <Text style={s.popularLabel}>{t(`app.ride.popular.${p.key}`, p.label)}</Text>
                  <View style={s.chev}>{busyKey === p.key ? <ActivityIndicator size="small" color={tokens.text} /> : <Ionicons name="chevron-forward" size={ms(12)} color={tokens.text} />}</View>
                </View>
                <Image source={{ uri: p.image }} style={s.popularImg} contentFit="cover" transition={150} />
              </Pressable>
            ))}
          </View>

          <View style={s.exploreHead}>
            <Text style={s.section}>{t("app.ride.explore", "Explore")}</Text>
            <Pressable onPress={() => setAllOpen(true)} hitSlop={8} style={s.viewAll} accessibilityRole="button">
              <Text style={s.viewAllText}>{t("app.ride.viewAll", "View All")}</Text>
              <Ionicons name="chevron-forward" size={ms(16)} color={tokens.sec} />
            </Pressable>
          </View>
          <View style={s.exploreRow}>
            <Pressable style={s.exploreCell} onPress={() => router.push("/package-delivery")} accessibilityRole="button">
              <View style={s.exploreIcon}><MaterialCommunityIcons name="package-variant-closed" size={ms(30)} color={tokens.brand} /></View>
              <Text style={s.exploreText}>{t("app.ride.parcelOnBike", "Parcel on Bike")}</Text>
            </Pressable>
            {vehicles.map((v) => (
              <Pressable key={v.id} style={s.exploreCell} onPress={() => startSearch(v.id)} accessibilityRole="button">
                <View style={s.exploreIcon}><MaterialCommunityIcons name={v.icon} size={ms(30)} color={tokens.brand} /></View>
                <Text style={s.exploreText}>{v.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: insets.bottom + ms(40) }} />
        </ScrollView>
      </Animated.View>

      <RideAllServicesSheet
        visible={allOpen}
        onClose={() => setAllOpen(false)}
        vehicles={vehicles}
        insets={insets}
        tokens={tokens}
        onPick={(v) => { setAllOpen(false); startSearch(v.id); }}
      />
    </View>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: tokens.bg },
    back: { position: "absolute", left: ms(14), width: ms(42), height: ms(42), borderRadius: ms(21), backgroundColor: tokens.surface, alignItems: "center", justifyContent: "center", shadowColor: "#171717", shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4, zIndex: 5 },
    pin: { position: "absolute", left: 0, right: 0, alignItems: "center" },
    pinBubble: { backgroundColor: "#1E9E4A", paddingHorizontal: ms(20), paddingVertical: ms(8), borderRadius: ms(18) },
    pinText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: "#FFFFFF" },
    pinStem: { width: 2, height: ms(14), backgroundColor: "#1E9E4A" },
    pinDot: { width: ms(22), height: ms(22), borderRadius: ms(11), backgroundColor: "#FFFFFF", borderWidth: 3, borderColor: "#2D6BE4", alignItems: "center", justifyContent: "center" },
    pinDotInner: { width: ms(8), height: ms(8), borderRadius: ms(4), backgroundColor: "#1E9E4A" },
    pill: { position: "absolute", left: ms(24), right: ms(24), flexDirection: "row", alignItems: "center", gap: ms(10), height: ms(44), paddingHorizontal: ms(16), borderRadius: ms(22), backgroundColor: tokens.surface, shadowColor: "#171717", shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
    pillDot: { width: ms(10), height: ms(10), borderRadius: ms(5), backgroundColor: "#1E9E4A" },
    pillText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.text },
    sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface, borderTopLeftRadius: ms(26), borderTopRightRadius: ms(26), shadowColor: "#171717", shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 12, overflow: "hidden" },
    handle: { alignSelf: "center", width: ms(44), height: 4, borderRadius: 2, backgroundColor: tokens.border, marginTop: ms(8), marginBottom: ms(12) },
    search: { marginHorizontal: ms(14), flexDirection: "row", alignItems: "center", gap: ms(8), padding: ms(8), borderRadius: ms(32), backgroundColor: tokens.sunken, borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border },
    searchInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: ms(10), minHeight: ms(54), paddingHorizontal: ms(16), borderRadius: ms(28), backgroundColor: tokens.surface },
    searchText: { flex: 1, fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    mic: { flexDirection: "row", alignItems: "center", gap: ms(6), minHeight: ms(54), paddingHorizontal: ms(16), borderRadius: ms(28), backgroundColor: tokens.brand },
    micText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.onBrand },
    scroll: { paddingTop: ms(14) },
    recentRow: { flexDirection: "row", alignItems: "center", gap: ms(14), marginHorizontal: ms(18), minHeight: ms(64), paddingVertical: ms(10), borderBottomWidth: 1, borderStyle: "dashed", borderBottomColor: tokens.border },
    recentName: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    recentAddr: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 2 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: ms(10), marginHorizontal: ms(14), marginTop: ms(18) },
    gridCell: { width: "31%", alignItems: "center", padding: ms(8), borderRadius: ms(12), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface },
    gridIcon: { width: "100%", height: ms(64), borderRadius: ms(8), backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center" },
    gridText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.text, textAlign: "center", marginTop: ms(8) },
    section: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.sec, marginHorizontal: ms(18), marginTop: ms(22), marginBottom: ms(12) },
    popularRow: { flexDirection: "row", gap: ms(12), marginHorizontal: ms(14) },
    popular: { flex: 1, padding: ms(10), borderRadius: ms(14), borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.surface },
    popularHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: ms(8) },
    popularLabel: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.text },
    chev: { width: ms(20), height: ms(20), borderRadius: ms(10), backgroundColor: tokens.brandSkin, alignItems: "center", justifyContent: "center" },
    popularImg: { width: "100%", height: ms(104), borderRadius: ms(10), backgroundColor: tokens.sunken },
    exploreHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: ms(18) },
    viewAll: { flexDirection: "row", alignItems: "center", gap: ms(2), marginTop: ms(10) },
    viewAllText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    exploreRow: { flexDirection: "row", gap: ms(12), marginHorizontal: ms(14) },
    exploreCell: { width: ms(78), alignItems: "center", gap: ms(8) },
    exploreIcon: { width: ms(64), height: ms(64), borderRadius: ms(14), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center" },
    exploreText: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.text, textAlign: "center" },
  });
