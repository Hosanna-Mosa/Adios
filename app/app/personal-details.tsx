import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { Header } from "@/components/ui/Header";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { customFetch } from "@/utils/api/custom-fetch";

import { fadeInDown } from "@/motion/presets";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { PersonalDetailsBody } from "@/features/auth/components/PersonalDetailsBody";
import {
  validateEmail,
  validateName,
  validatePersonalDetails,
  validateUsername,
  type PersonalDetailsErrors,
} from "@/features/auth/personal-details.validation";
import { showAlert } from "@/components/ui/AppAlert";

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
  const [errors, setErrors] = useState<PersonalDetailsErrors>({});
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
    // Clear a field's error as soon as it's fixed, but don't start complaining
    // about a field the user hasn't finished typing yet.
    setErrors((current) => (current[field as keyof PersonalDetailsErrors] ? { ...current, [field]: undefined } : current));
  };

  const VALIDATORS: Record<string, (value: string) => string> = {
    name: validateName,
    username: validateUsername,
    email: validateEmail,
  };

  const blurField = (field: string, value: string) => () => {
    const message = VALIDATORS[field](value);
    setErrors((current) => ({ ...current, [field]: message || undefined }));
  };

  const handleSave = async () => {
    const found = validatePersonalDetails({ name, username, email });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      setSaving(true);
      const data = await customFetch<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), username: username.trim(), email: email.trim() }),
      });
      if (data) {
        setUser(data);
        router.back();
      }
    } catch (err: any) {
      showAlert("Couldn't save", err.message || "Please try again.");
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
        blurField={blurField}
        editField={editField}
        email={email}
        errors={errors}
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

    label: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1, textTransform: "uppercase", color: tokens.muted, marginBottom: 6 },
    field: { borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.text, backgroundColor: tokens.surface },
    fieldInvalid: { borderColor: tokens.error, borderWidth: 2 },
    fieldError: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.error, marginTop: 6 },

    phoneField: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.sunken, borderRadius: 12, minHeight: 52, paddingHorizontal: 14 },
    phoneText: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec },
    verifiedPill: { backgroundColor: tokens.successSkin, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    verifiedPillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.5, textTransform: "uppercase", color: tokens.success },
    phoneHint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginTop: 6 },
    phoneHintLink: { color: accent.accent, fontFamily: fontFamilies.body.semibold },

    footer: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border, paddingHorizontal: 16, paddingTop: 14 },
    saveBtn: { backgroundColor: accent.accent, borderRadius: 14, minHeight: moderateScale(52), alignItems: "center", justifyContent: "center" },
    saveBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: accent.on },
  });
