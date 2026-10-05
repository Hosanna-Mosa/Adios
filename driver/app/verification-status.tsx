import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";

/**
 * Where a driver waits after finishing onboarding: an admin has to approve the
 * documents before the driver can go online. Also explains a rejection, or
 * which documents the admin asked for again (with a way back into onboarding).
 *
 * The auth gate moves the driver to the tabs on its own once the refreshed
 * profile says they are approved.
 */
export default function VerificationStatusScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const onboardingStatus = useDriverStore((s) => s.onboardingStatus);
  const review = useDriverStore((s) => s.verificationReview);
  const refreshSession = useDriverStore((s) => s.refreshSession);
  const logout = useDriverStore((s) => s.logout);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setRefreshing(false);
    }
  }, [refreshSession]);

  // Pick up a decision made while the app was in the background.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const documentLabels: Record<string, string> = {
    aadhaar: t("verification.docs.aadhaar", "Aadhaar"),
    pan: t("verification.docs.pan", "PAN card"),
    license: t("verification.docs.license", "Driving licence"),
    bank: t("verification.docs.bank", "Bank account"),
    selfie: t("verification.docs.selfie", "Selfie"),
  };

  const content = (() => {
    switch (onboardingStatus) {
      case "resubmission_required":
        return {
          icon: "file-text" as const,
          tint: Colors.warning,
          background: Colors.warningLight,
          title: t("verification.resubmitTitle", "Documents needed"),
          body: t(
            "verification.resubmitBody",
            "Our team couldn't verify some of your documents. Please upload them again and resubmit.",
          ),
        };
      case "rejected":
        return {
          icon: "x-circle" as const,
          tint: Colors.error,
          background: Colors.errorLight,
          title: t("verification.rejectedTitle", "Application not approved"),
          body: t(
            "verification.rejectedBody",
            "We couldn't approve your application. You can update your details and resubmit, or contact support.",
          ),
        };
      default:
        return {
          icon: "clock" as const,
          tint: Colors.primaryDark,
          background: Colors.primaryLight,
          title: t("verification.pendingTitle", "Verification in progress"),
          body: t(
            "verification.pendingBody",
            "Thanks for completing your onboarding. Our team is verifying your documents — you'll be notified and can go online as soon as you're approved.",
          ),
        };
    }
  })();

  const canEditDocuments = onboardingStatus === "resubmission_required" || onboardingStatus === "rejected";
  const requested = review?.requestedDocuments || [];

  return (
    <ScrollBox
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
    >
      <Box style={[styles.iconCircle, { backgroundColor: content.background }]}>
        <Feather name={content.icon} size={36} color={content.tint} />
      </Box>

      <AppText size="extraLarge" weight="bold" color={Colors.text} style={styles.title}>
        {content.title}
      </AppText>
      <AppText size="medium" color={Colors.textSecondary} style={styles.body}>
        {content.body}
      </AppText>

      {onboardingStatus === "resubmission_required" && requested.length > 0 && (
        <Box style={styles.card}>
          <AppText size="small" weight="bold" color={Colors.textSecondary} style={styles.cardLabel}>
            {t("verification.requestedDocuments", "Upload again")}
          </AppText>
          {requested.map((doc) => (
            <Box key={doc} style={styles.docRow}>
              <Feather name="alert-circle" size={16} color={Colors.warning} />
              <AppText size="medium" weight="semibold" color={Colors.text}>
                {documentLabels[doc] || doc}
              </AppText>
            </Box>
          ))}
        </Box>
      )}

      {(review?.note || review?.rejectionReason) && (
        <Box style={styles.card}>
          <AppText size="small" weight="bold" color={Colors.textSecondary} style={styles.cardLabel}>
            {t("verification.noteFromTeam", "Note from our team")}
          </AppText>
          <AppText size="medium" color={Colors.text}>
            {review?.note || review?.rejectionReason}
          </AppText>
        </Box>
      )}

      <Box style={styles.actions}>
        {canEditDocuments && (
          <Button
            title={t("verification.updateDocuments", "Update documents")}
            // Requested documents get their own short screen; a rejected
            // driver goes back through the full onboarding flow.
            onPress={() =>
              router.push(
                onboardingStatus === "resubmission_required" && requested.length > 0
                  ? "/reupload-documents"
                  : "/onboarding",
              )
            }
            fullWidth
          />
        )}
        <Button
          title={t("verification.checkStatus", "Check status")}
          variant="secondary"
          onPress={refresh}
          loading={refreshing}
          fullWidth
        />
        <Button
          title={t("verification.signOut", "Sign out")}
          variant="ghost"
          onPress={() => {
            logout();
            router.replace("/auth");
          }}
          fullWidth
        />
      </Box>
    </ScrollBox>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, alignItems: "center" },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { textAlign: "center", marginBottom: 8 },
  body: { textAlign: "center", marginBottom: 24 },
  card: {
    alignSelf: "stretch",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  cardLabel: { textTransform: "uppercase", letterSpacing: 0.5 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  actions: { alignSelf: "stretch", gap: 12, marginTop: 8 },
});
