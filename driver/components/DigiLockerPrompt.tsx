import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "@/constants/colors";

/**
 * "Verify instantly with DigiLocker" call-to-action.
 *
 * Dropped above the manual Aadhaar/PAN inputs so the fast path is the obvious
 * one, while manual entry stays available underneath for drivers who don't use
 * DigiLocker. Once verification succeeds it collapses into a confirmation row.
 */
export function DigiLockerPrompt({
  verified,
  returnTo,
  subtitle,
}: {
  /** Show the verified confirmation instead of the CTA. */
  verified?: boolean;
  /** Route to send the driver back to after verifying. */
  returnTo?: string;
  subtitle?: string;
}) {
  if (verified) {
    return (
      <View style={styles.verifiedBox}>
        <View style={styles.verifiedIcon}>
          <Feather name="check" size={14} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.verifiedTitle}>Verified through DigiLocker</Text>
          <Text style={styles.verifiedSubtitle}>
            Confirmed against government records.
          </Text>
        </View>
      </View>
    );
  }

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/digilocker-verify",
      params: returnTo ? { returnTo } : {},
    } as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={open} activeOpacity={0.85}>
      <View style={styles.icon}>
        <Feather name="shield" size={20} color={Colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Verify with DigiLocker</Text>
          <View style={styles.fastChip}>
            <Text style={styles.fastChipText}>FASTEST</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {subtitle || "Pull your Aadhaar and PAN straight from government records — no typing."}
        </Text>
      </View>

      <Feather name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}


/**
 * A value that came from DigiLocker and must not be edited.
 *
 * Aadhaar in particular is stored masked (XXXXXXXX4321), so it can never
 * satisfy a manual 12-digit format check — showing it in an editable input
 * produces a permanent "invalid number" error.
 */
export function DigiLockerField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        <Feather name="lock" size={13} color={Colors.textMuted} />
      </View>
    </View>
  );
}

/** Divider for "or enter details manually below". */
export function DigiLockerDivider({ label = "or enter manually" }: { label?: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15, fontWeight: "700", color: Colors.text },
  fastChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fastChipText: { fontSize: 9, fontWeight: "800", color: Colors.white, letterSpacing: 0.5 },
  subtitle: { fontSize: 12.5, color: Colors.textMuted, marginTop: 3, lineHeight: 17 },

  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 14,
    padding: 14,
  },
  verifiedIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTitle: { fontSize: 14, fontWeight: "700", color: "#2e7d32" },
  verifiedSubtitle: { fontSize: 12, color: "#2e7d32", opacity: 0.85, marginTop: 1 },

  field: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  fieldLabel: { fontSize: 11.5, color: Colors.textMuted, letterSpacing: 0.3 },
  fieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  fieldValue: { fontSize: 15, fontWeight: "600", color: Colors.text, letterSpacing: 0.5 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted, fontWeight: "500" },
});

export default DigiLockerPrompt;
