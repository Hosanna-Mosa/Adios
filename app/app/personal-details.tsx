import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Header } from "@/components/ui/Header";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { customFetch } from "@/utils/api/custom-fetch";

import { fadeInDown } from "@/motion/presets";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { PersonalDetailsBody } from "@/features/auth/components/PersonalDetailsBody";

export default function PersonalDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  // The three fields above only seed from whatever the store happened to hold
  // at mount, which is empty on a cold start or while the profile refetch is
  // still in flight. Pull the authoritative profile and fill in any field the
  // user hasn't started editing, so the real email always shows up.
  const editedFields = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    customFetch<any>("/users/profile")
      .then((data) => {
        if (!data || cancelled) return;
        setUser(data);
        if (!editedFields.current.has("name")) setName(data.name || "");
        if (!editedFields.current.has("username")) setUsername(data.username || "");
        if (!editedFields.current.has("email")) setEmail(data.email || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const editField = (field: string, setter: (v: string) => void) => (value: string) => {
    editedFields.current.add(field);
    setter(value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await customFetch<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, username, email }),
      });
      if (data) {
        setUser(data);
        router.back();
      }
    } catch (err: any) {
      Alert.alert("Couldn't save", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell style={{ paddingTop: insets.top }}>
      <Header
        title="Personal details"
        onBack={() => router.back()}
        style={{ paddingTop: 12, paddingBottom: 12 }}
        entering={fadeInDown(0)}
      />

      <PersonalDetailsBody
        accent={accent}
        editField={editField}
        email={email}
        handleSave={handleSave}
        insets={insets}
        name={name}
        saving={saving}
        setEmail={setEmail}
        setName={setName}
        setUsername={setUsername}
        styles={styles}
        tokens={tokens}
        user={user}
        username={username}
      />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({

    label: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 6 },
    field: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.text, backgroundColor: tokens.surface },

    phoneField: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.sunken, borderRadius: 12, minHeight: 52, paddingHorizontal: 14 },
    phoneText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: moderateScale(15), color: tokens.sec },
    verifiedPill: { backgroundColor: tokens.successSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    verifiedPillText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(10), letterSpacing: 0.5, textTransform: "uppercase", color: tokens.success },
    phoneHint: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 6 },
    phoneHintLink: { color: accent.accent, fontFamily: fontFamilies.body.semibold },

    footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border, paddingHorizontal: 16, paddingTop: 14 },
    saveBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    saveBtnText: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(15), color: accent.on },
  });
