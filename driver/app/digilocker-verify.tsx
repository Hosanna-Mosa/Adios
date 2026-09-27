import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import {
  AadhaarData,
  DigiLockerError,
  DrivingLicenceData,
  PanData,
  getAadhaar,
  getDrivingLicence,
  getPan,
  getStatus,
  startSession,
  syncToDriver,
  unlink,
} from "@/utils/digilocker";

/**
 * DigiLocker identity verification.
 *
 * Flow: the app asks the backend to start a consent session, opens the returned
 * URL in an auth-session browser, and waits. DigiLocker returns the driver to
 * the backend's callback, which completes the link and bounces back into the
 * app via the `flavour-driver://` deep link — so the app never handles the
 * authorization code itself.
 *
 * If the deep link does not fire (driver closed the browser manually, or the
 * backend has no DIGILOCKER_CLIENT_REDIRECT_URL configured), we re-check status
 * on return rather than assuming failure — the link may well have succeeded.
 */

type Phase =
  | "checking"      // reading current status
  | "intro"         // not linked — show the pitch + consent CTA
  | "authorizing"   // browser is open
  | "finalising"    // back from browser, pulling documents
  | "done"          // linked + synced, showing what we got
  | "error";

export default function DigiLockerVerifyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

  const [phase, setPhase] = useState<Phase>("checking");
  const [sandbox, setSandbox] = useState(false);
  const [aadhaar, setAadhaar] = useState<AadhaarData | null>(null);
  const [pan, setPan] = useState<PanData | null>(null);
  const [licence, setLicence] = useState<DrivingLicenceData | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [holderName, setHolderName] = useState<string | undefined>();

  const fade = useRef(new Animated.Value(0)).current;
  const mounted = useRef(true);
  /** Stops the browser-promise path and the focus-recovery path colliding. */
  const busy = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [phase, fade]);

  const token = () => useDriverStore.getState().token;

  // ── Pull the documents we just gained access to, then persist them ─────────
  const loadAndSync = useCallback(async () => {
    const authToken = token();
    if (!authToken || busy.current) return;

    busy.current = true;
    setPhase("finalising");

    try {
      // Aadhaar and PAN are fetched independently: a driver may legitimately
      // have one and not the other, and that should not fail the whole flow.
      const [aadhaarResult, panResult, licenceResult] = await Promise.allSettled([
        getAadhaar(authToken),
        getPan(authToken),
        getDrivingLicence(authToken),
      ]);

      if (!mounted.current) return;

      if (aadhaarResult.status === "fulfilled") setAadhaar(aadhaarResult.value.data);
      if (panResult.status === "fulfilled") setPan(panResult.value.data);
      if (licenceResult.status === "fulfilled") setLicence(licenceResult.value.data);

      // If neither document came back, the grant itself is the problem.
      if (aadhaarResult.status === "rejected" && panResult.status === "rejected") {
        const reason = aadhaarResult.reason;
        if (reason instanceof DigiLockerError && reason.needsConsent) {
          setPhase("intro");
          setErrorMessage("Your DigiLocker session expired. Please verify again.");
          return;
        }
        throw reason;
      }

      const sync = await syncToDriver(authToken);
      if (!mounted.current) return;

      setSkipped(sync.skipped || []);
      setSandbox(sync.sandbox);

      if (sync.driver?.aadhaarVerified || sync.driver?.panVerified) {
        setIdentityVerified(true);
      }

      setPhase("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (!mounted.current) return;
      handleError(error);
    } finally {
      busy.current = false;
    }
  }, [setIdentityVerified]);

  const handleError = (error: unknown) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    if (error instanceof DigiLockerError) {
      if (error.code === "DIGILOCKER_DISABLED") {
        setErrorMessage(
          "DigiLocker verification is not available right now. Please use manual verification instead."
        );
      } else if (error.needsConsent) {
        setErrorMessage("Your DigiLocker session has ended. Please verify again.");
        setPhase("intro");
        return;
      } else if (error.code === "DIGILOCKER_RATE_LIMITED") {
        setErrorMessage("Too many attempts. Please wait a minute and try again.");
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }

    setPhase("error");
  };

  // ── On mount: are we already linked? ──────────────────────────────────────
  const refreshStatus = useCallback(async () => {
    const authToken = token();
    if (!authToken) {
      setErrorMessage("Please sign in again.");
      setPhase("error");
      return;
    }

    try {
      const status = await getStatus(authToken);
      if (!mounted.current) return;

      setSandbox(status.sandbox);
      setHolderName(status.account?.name);

      if (status.linked) {
        await loadAndSync();
      } else {
        setPhase("intro");
      }
    } catch (error) {
      if (!mounted.current) return;
      handleError(error);
    }
  }, [loadAndSync]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Safety net. `openAuthSessionAsync` normally resolves when the browser
  // redirects back, but the deep link can also be consumed by the router first
  // (see app/digilocker-callback.tsx). If we regain focus still waiting, ask
  // the server what happened rather than sitting on a spinner forever.
  useFocusEffect(
    useCallback(() => {
      if (phase !== "authorizing") return;

      let cancelled = false;
      const timer = setTimeout(async () => {
        const authToken = token();
        if (!authToken || cancelled || busy.current) return;

        try {
          const status = await getStatus(authToken);
          if (cancelled || !mounted.current || busy.current) return;
          if (status.linked) await loadAndSync();
        } catch {
          // Leave the existing flow to report the failure.
        }
      }, 600);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }, [phase, loadAndSync])
  );

  // ── Start consent ─────────────────────────────────────────────────────────
  const beginVerification = async () => {
    const authToken = token();
    if (!authToken) return;

    setErrorMessage("");
    setPhase("authorizing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // The backend's callback page redirects here once consent completes,
      // which is what closes the browser and hands control back to the app.
      // Resolved before the session is created so the backend can store it.
      const returnUrl = Linking.createURL("digilocker-callback");

      const session = await startSession(authToken, {
        purpose: "kyc",
        clientRedirectUrl: returnUrl,
      });
      if (!mounted.current) return;

      setSandbox(session.sandbox);

      const result = await WebBrowser.openAuthSessionAsync(session.authUrl, returnUrl, {
        showInRecents: false,
      });

      if (!mounted.current) return;

      if (result.type === "success" && result.url) {
        // The callback page appends ?status=success|failed.
        if (result.url.includes("status=failed")) {
          setPhase("intro");
          setErrorMessage("Verification was not completed. You can try again.");
          return;
        }
        await loadAndSync();
        return;
      }

      // Dismissed or cancelled. The driver may still have completed consent
      // before closing the window, so confirm with the server rather than
      // assuming it failed.
      const status = await getStatus(authToken);
      if (!mounted.current) return;

      if (status.linked) {
        await loadAndSync();
      } else {
        setPhase("intro");
        setErrorMessage("Verification was cancelled. You can try again whenever you're ready.");
      }
    } catch (error) {
      if (!mounted.current) return;
      handleError(error);
    }
  };

  // ── Unlink ────────────────────────────────────────────────────────────────
  const confirmUnlink = () => {
    Alert.alert(
      "Remove DigiLocker?",
      "Your verified details will stay on your profile, but you'll need to verify again to refresh them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const authToken = token();
            if (!authToken) return;
            try {
              await unlink(authToken);
              if (!mounted.current) return;
              setAadhaar(null);
              setPan(null);
              setPhase("intro");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              handleError(error);
            }
          },
        },
      ]
    );
  };

  const finish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Going back returns to the *existing* onboarding screen with the driver's
    // progress intact. replace() would mount a fresh one and drop them at
    // step 1, so it is only a fallback for when there is no stack to pop.
    if (router.canGoBack()) {
      router.back();
    } else if (params.returnTo) {
      router.replace(params.returnTo as any);
    } else {
      router.replace("/(tabs)");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={styles.backBtn} />
      </View>

      {sandbox && (
        <View style={styles.sandboxBanner}>
          <Feather name="alert-triangle" size={14} color="#b06000" />
          <Text style={styles.sandboxText}>
            Test mode — documents shown here are simulated, not real.
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade }}>
          {phase === "checking" && <CheckingState />}
          {phase === "intro" && (
            <IntroState
              onStart={beginVerification}
              errorMessage={errorMessage}
            />
          )}
          {phase === "authorizing" && <BusyState label="Waiting for DigiLocker…" />}
          {phase === "finalising" && <BusyState label="Fetching your documents…" />}
          {phase === "done" && (
            <DoneState
              aadhaar={aadhaar}
              pan={pan}
              licence={licence}
              skipped={skipped}
              holderName={holderName}
              onUnlink={confirmUnlink}
            />
          )}
          {phase === "error" && (
            <ErrorState message={errorMessage} onRetry={refreshStatus} />
          )}
        </Animated.View>
      </ScrollView>

      {(phase === "intro" || phase === "done") && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {phase === "intro" ? (
            <>
              <PrimaryButton title="Verify with DigiLocker" icon="shield" onPress={beginVerification} />
              <TouchableOpacity onPress={finish} style={styles.secondaryLink}>
                <Text style={styles.secondaryLinkText}>Enter details manually instead</Text>
              </TouchableOpacity>
            </>
          ) : (
            <PrimaryButton title="Continue" icon="arrow-right" onPress={finish} />
          )}
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Phase views
// ═══════════════════════════════════════════════════════════════════════════

function CheckingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.centeredText}>Checking your verification status…</Text>
    </View>
  );
}

function BusyState({ label }: { label: string }) {
  return (
    <View style={styles.centered}>
      <View style={styles.busyIcon}>
        <Feather name="shield" size={30} color={Colors.primary} />
      </View>
      <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
      <Text style={styles.centeredText}>{label}</Text>
      <Text style={styles.centeredHint}>This usually takes a few seconds.</Text>
    </View>
  );
}

function IntroState({
  onStart,
  errorMessage,
}: {
  onStart: () => void;
  errorMessage?: string;
}) {
  return (
    <View style={{ gap: 20 }}>
      {!!errorMessage && (
        <View style={styles.inlineNotice}>
          <Feather name="info" size={16} color={Colors.primaryDark} />
          <Text style={styles.inlineNoticeText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Feather name="shield" size={34} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Verify instantly with DigiLocker</Text>
        <Text style={styles.heroSubtitle}>
          Confirm your identity and driving licence straight from your government records.
          No photos, no typing, no waiting for approval.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What we'll read</Text>
        <ReadItem icon="credit-card" title="Aadhaar" detail="Your name, date of birth and address" />
        <ReadItem icon="file-text" title="PAN" detail="Your PAN number and name" />
        <ReadItem
          icon="award"
          title="Driving licence"
          detail="Licence number, validity and vehicle class"
          last
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How your data is handled</Text>
        <Assurance icon="eye-off" text="We store only the last 4 digits of your Aadhaar — never the full number." />
        <Assurance icon="lock" text="You sign in on DigiLocker's own screen. We never see your DigiLocker password." />
        <Assurance icon="x-circle" text="You can remove this access at any time from your profile." last />
      </View>

      <Text style={styles.consentNote}>
        By continuing, you allow Flavour to read the documents listed above from your DigiLocker
        account for driver verification.
      </Text>
    </View>
  );
}

function DoneState({
  aadhaar,
  pan,
  licence,
  skipped,
  holderName,
  onUnlink,
}: {
  aadhaar: AadhaarData | null;
  pan: PanData | null;
  licence: DrivingLicenceData | null;
  skipped: string[];
  holderName?: string;
  onUnlink: () => void;
}) {
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.successHero}>
        <View style={styles.successIcon}>
          <Feather name="check" size={32} color={Colors.white} />
        </View>
        <Text style={styles.heroTitle}>Identity verified</Text>
        <Text style={styles.heroSubtitle}>
          {holderName
            ? `Verified against government records for ${holderName}.`
            : "Your details were confirmed against government records."}
        </Text>
      </View>

      {aadhaar && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Aadhaar</Text>
            <View style={styles.verifiedChip}>
              <Feather name="check-circle" size={12} color={Colors.success} />
              <Text style={styles.verifiedChipText}>Verified</Text>
            </View>
          </View>
          <Field label="Name" value={aadhaar.name} />
          <Field label="Date of birth" value={aadhaar.dob} />
          <Field label="Aadhaar number" value={aadhaar.maskedAadhaarNumber} />
          {!!aadhaar.address?.full && <Field label="Address" value={aadhaar.address.full} last />}
        </View>
      )}

      {pan && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>PAN</Text>
            <View style={styles.verifiedChip}>
              <Feather name="check-circle" size={12} color={Colors.success} />
              <Text style={styles.verifiedChipText}>Verified</Text>
            </View>
          </View>
          <Field label="PAN number" value={pan.panNumber} />
          <Field label="Name" value={pan.name} last />
        </View>
      )}

      {licence && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Driving Licence</Text>
            <View style={styles.verifiedChip}>
              <Feather name="check-circle" size={12} color={Colors.success} />
              <Text style={styles.verifiedChipText}>Verified</Text>
            </View>
          </View>
          <Field label="Licence number" value={licence.licenceNumber} />
          <Field label="Valid till" value={licence.validTill} />
          <Field label="Vehicle class" value={licence.vehicleClass} />
          <Field label="Issued by" value={licence.issuedBy} last />
        </View>
      )}

      {skipped.length > 0 && (
        <View style={styles.inlineNotice}>
          <Feather name="info" size={16} color={Colors.primaryDark} />
          <Text style={styles.inlineNoticeText}>
            {describeSkipped(skipped)}
          </Text>
        </View>
      )}

      <Pressable onPress={onUnlink} style={styles.unlinkBtn}>
        <Feather name="x-circle" size={16} color={Colors.textMuted} />
        <Text style={styles.unlinkText}>Remove DigiLocker access</Text>
      </Pressable>
    </View>
  );
}

/** Turn the sync response's `skipped` list into one plain sentence. */
function describeSkipped(skipped: string[]): string {
  const labels: Record<string, string> = {
    aadhaar: "Aadhaar",
    pan: "PAN card",
    drivingLicence: "driving licence",
  };

  const names = skipped.map((key) => labels[key] || key);
  if (names.length === 0) return "Some documents weren't available in your DigiLocker account.";

  const list =
    names.length === 1
      ? names[0]
      : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];

  return `No ${list} is issued to your DigiLocker account. You can add it in the DigiLocker app, or enter it manually later.`;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: Colors.errorLight }]}>
          <Feather name="alert-circle" size={32} color={Colors.error} />
        </View>
        <Text style={styles.heroTitle}>Couldn't verify</Text>
        <Text style={styles.heroSubtitle}>{message}</Text>
      </View>

      <PrimaryButton title="Try again" icon="refresh-cw" onPress={onRetry} />

      <TouchableOpacity
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        style={styles.secondaryLink}
      >
        <Text style={styles.secondaryLinkText}>Enter details manually instead</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Small pieces
// ═══════════════════════════════════════════════════════════════════════════

function ReadItem({
  icon,
  title,
  detail,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.readItem, !last && styles.rowDivider]}>
      <View style={styles.readIcon}>
        <Feather name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.readTitle}>{title}</Text>
        <Text style={styles.readDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function Assurance({
  icon,
  text,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.assurance, !last && styles.rowDivider]}>
      <Feather name={icon} size={15} color={Colors.success} />
      <Text style={styles.assuranceText}>{text}</Text>
    </View>
  );
}

function Field({ label, value, last }: { label: string; value?: string; last?: boolean }) {
  if (!value) return null;
  return (
    <View style={[styles.field, !last && styles.rowDivider]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.primaryBtnText}>{title}</Text>
      {icon && <Feather name={icon} size={20} color={Colors.white} />}
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.text },

  sandboxBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff4e5",
    borderRadius: 10,
  },
  sandboxText: { flex: 1, fontSize: 11.5, color: "#b06000", lineHeight: 16 },

  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  centered: { alignItems: "center", paddingVertical: 80, gap: 12 },
  centeredText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  centeredHint: { fontSize: 13, color: Colors.textMuted, textAlign: "center" },
  busyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  hero: { alignItems: "center", gap: 10, paddingTop: 12, paddingBottom: 4 },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  successHero: { alignItems: "center", gap: 10, paddingTop: 12, paddingBottom: 4 },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, marginBottom: 10 },

  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  readItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  readIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  readTitle: { fontSize: 14.5, fontWeight: "600", color: Colors.text },
  readDetail: { fontSize: 12.5, color: Colors.textMuted, marginTop: 1 },

  assurance: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 11 },
  assuranceText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  field: { paddingVertical: 11 },
  fieldLabel: { fontSize: 11.5, color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 },
  fieldValue: { fontSize: 14.5, color: Colors.text, fontWeight: "600", marginTop: 3, lineHeight: 20 },

  verifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  verifiedChipText: { fontSize: 11, fontWeight: "700", color: Colors.success },

  inlineNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
  },
  inlineNoticeText: { flex: 1, fontSize: 13, color: Colors.primaryDark, lineHeight: 19 },

  consentNote: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  unlinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  unlinkText: { fontSize: 14, color: Colors.textMuted, fontWeight: "500" },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnText: { color: Colors.white, fontSize: 17, fontWeight: "700" },

  secondaryLink: { alignItems: "center", paddingVertical: 14 },
  secondaryLinkText: { fontSize: 14, color: Colors.textSecondary, fontWeight: "500" },
});
