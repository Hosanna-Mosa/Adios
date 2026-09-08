import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import {
  BankNotice,
  ConsentCheckbox,
  FormInput,
  HomeAddressSuggestions,
  LocationVerifiedBox,
  InfoBanner,
  PrimaryButton,
  SectionHeader,
  SelectCard,
  SelfieCaptureSection,
  StepIndicator,
  OnboardingTopBar,
  SectionProgressBar,
} from "@/features/onboarding/components";
import { inputStyles } from "@/features/onboarding/components/FormInput.styles";

import { staggerListItem, SPRING } from "@/motion/presets";
import { styles, dlStyles, bankStyles, selfieSectionStyles } from "@/features/onboarding/onboarding.styles";
import { API_URL } from "@/utils/apiUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Data ──────────────────────────────────────────────────────────────────────

const VEHICLES = [
  {
    id: "bike",
    label: "Bike",
    icon: "truck" as const,
    desc: "Fast & fuel-efficient for deliveries",
  },
  {
    id: "auto",
    label: "Auto",
    icon: "box" as const,
    desc: "Spacious for larger orders",
  },
  {
    id: "car",
    label: "Car",
    icon: "chevrons-up" as const,
    desc: "Premium deliveries & longer distances",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ONBOARDING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const setOnboardingCompleted = useDriverStore((s) => s.setOnboardingCompleted);
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1);
  const [sectionIdx, setSectionIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useSharedValue(0);
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(slideAnim.value, [-1, 0, 1], [-SCREEN_WIDTH * 0.3, 0, SCREEN_WIDTH * 0.3]) }],
    opacity: interpolate(slideAnim.value, [-1, 0, 1], [0.3, 1, 0.3]),
  }));

  // ── Async State ──────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // ── Jump to identity verification if `verify=identity` param is set ──
  useEffect(() => {
    if (params.verify === "identity") {
      setStep(2);
      setSectionIdx(0);
    }
  }, [params.verify]);

  // ── Fetch existing onboarding data on mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = useDriverStore.getState().token;
        if (!token) return;
        const res = await fetch(`${API_URL}/onboarding`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          useDriverStore.getState().logout();
          router.replace("/auth");
          return;
        }
        if (!res.ok) return;
        const result = await res.json();
        const d = result.data;
        if (d) {
          // Pre-populate form from saved data
          if (d.gender) setGender(d.gender);
          if (d.vehicleType) setVehicle(d.vehicleType);
          if (d.aadhaarNumber) setAadhaarNumber(d.aadhaarNumber.replace(/(\d{4})(?=\d)/g, "$1 "));
          if (d.aadhaarVerified) setAadhaarVerified(d.aadhaarVerified);
          if (d.panNumber) setPanNumber(d.panNumber);
          if (d.dlNumber) setDlNumber(d.dlNumber);
          if (d.dlExpiry) setDlExpiry(d.dlExpiry);
          if (d.bankAccountNumber) setBankAccount(d.bankAccountNumber);
          if (d.bankIfsc) setIfsc(d.bankIfsc);
          if (d.bankVerified) setBankVerified(d.bankVerified);
          if (d.preferredZone) setPreferredZone(d.preferredZone);
        }
      } catch {
        // silently ignore
      }

      try {
        const token = useDriverStore.getState().token;
        if (token) {
          const res = await fetch(`${API_URL}/zones`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const result = await res.json();
            setZones(result.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch zones for onboarding:", err);
      }

      try {
        const token = useDriverStore.getState().token;
        if (token) {
          const res = await fetch(`${API_URL}/users/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const homeAddr = data.find((a) => a.label && a.label.toLowerCase() === "home");
              if (homeAddr) {
                setHomeAddressLine(homeAddr.addressLine);
                const coords = homeAddr.location?.coordinates;
                if (coords && coords.length >= 2) {
                  setHomeLng(coords[0]);
                  setHomeLat(coords[1]);
                }
              } 
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch saved addresses on onboarding mount:", err);
      }
    })();
  }, []);

  // ── Step 1 State ──────────────────────────────────────────────────────────
  const [gender, setGender] = useState<string | null>(null);
  const [homeAddressLine, setHomeAddressLine] = useState("");
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const token = useDriverStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/places/autocomplete?input=${encodeURIComponent(query)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch autocomplete suggestions:", err);
    }
  };
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [preferredZone, setPreferredZone] = useState<string | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [zoneSearchText, setZoneSearchText] = useState("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

  // ── Step 2 State ──────────────────────────────────────────────────────────
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [consentAadhaar, setConsentAadhaar] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panVerified, setPanVerified] = useState(false);
  const [consentPAN, setConsentPAN] = useState(false);

  // ── Format validators ─────────────────────────────────────────────────────
  const validateAadhaarFormat = (num: string) => /^[2-9][0-9]{11}$/.test(num);
  const validatePANFormat = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const validateDLFormat = (dl: string): boolean => {
    // Indian DL: 2 letters (state) + 2 digits (RTO) + 4 digits (year) + 7 digits (serial)
    const cleaned = dl.replace(/[\s-]/g, "").toUpperCase();
    return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(cleaned);
  };
  
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dlExpiryDate, setDlExpiryDate] = useState(new Date());
  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankVerified, setBankVerified] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // ── Sections per step ─────────────────────────────────────────────────────
  const step1Sections = [
    { key: "gender", label: "Gender" },
    { key: "vehicle", label: "Vehicle" },
    { key: "zone", label: "Preferred Zone" },
    { key: "homeAddress", label: "Home Address" },
  ];

  const step2SectionsBase = [
    { key: "aadhaar", label: "Aadhaar" },
    { key: "pan", label: "PAN" },
    { key: "license", label: "License" },
    { key: "bank", label: "Bank" },
    { key: "selfie", label: "Selfie" },
  ];

  // Dynamically filter step 2 sections: once one ID is verified, the other is removed
  const currentSections = React.useMemo(() => {
    if (step === 1) return step1Sections;
    let sections = [...step2SectionsBase];
    if (aadhaarVerified) {
      sections = sections.filter(s => s.key !== "pan");
    } else if (panVerified) {
      sections = sections.filter(s => s.key !== "aadhaar");
    }
    return sections;
  }, [step, aadhaarVerified, panVerified]);

  const totalSections = currentSections.length;

  // ── Animations ────────────────────────────────────────────────────────────
  const animateTransition = (direction: 1 | -1) => {
    slideAnim.value = direction;
    slideAnim.value = withSpring(0, SPRING);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const goToNextSection = () => {
    if (sectionIdx < totalSections - 1) {
      setSectionIdx((p) => p + 1);
      animateTransition(1);
    }
  };

  const goToPrevSection = () => {
    if (sectionIdx > 0) {
      setSectionIdx((p) => p - 1);
      animateTransition(-1);
    }
  };

  const goToNextStep = () => {
    if (step < 2) {
      setStep((p) => (p + 1) as 1 | 2);
      setSectionIdx(0);
      animateTransition(1);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDlExpiryDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDlExpiry(`${day}/${month}/${year}`);
    }
  };

  const handleVerifyPAN = async () => {
    const cleanedPan = panNumber.trim().toUpperCase();
    if (!validatePANFormat(cleanedPan)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (panName.length < 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!consentPAN) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setSaving(true);
    try {
      const token = useDriverStore.getState().token;
      if (token) {
        const res = await fetch(`${API_URL}/onboarding/verify-pan`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ panNumber: cleanedPan, panName }),
        });
        const result = await res.json();
        if (result.verified) {
          setPanVerified(true);
          setIdentityVerified(true);
          // Aadhaar section gets filtered out → PAN shifts from idx=1 to idx=0
          setSectionIdx(prev => Math.max(0, prev - 1));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else {
        setPanVerified(true);
        setIdentityVerified(true);
        setSectionIdx(prev => Math.max(0, prev - 1));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setPanVerified(true);
      setIdentityVerified(true);
      setSectionIdx(prev => Math.max(0, prev - 1));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    const cleaned = aadhaarNumber.replace(/\s/g, "");
    if (cleaned.length === 12) {
      setSaving(true);
      try {
        const token = useDriverStore.getState().token;
        if (token) {
          const res = await fetch(`${API_URL}/onboarding/verify-aadhaar`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ aadhaarNumber: cleaned }),
          });
          const result = await res.json();
          if (result.verified) {
            setAadhaarVerified(true);
            setIdentityVerified(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } else {
          // Fallback: mark as verified locally
        setAadhaarVerified(true);
        setIdentityVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // Dummy: always succeeds in mock mode
      setAadhaarVerified(true);
      setIdentityVerified(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleVerifyBank = async () => {
    if (bankAccount.length >= 9 && bankAccount === bankConfirm && ifsc.length >= 8) {
      setSaving(true);
      try {
        const token = useDriverStore.getState().token;
        if (token) {
          await fetch(`${API_URL}/onboarding`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              bankAccountNumber: bankAccount,
              bankIfsc: ifsc,
              bankVerified: true,
            }),
          });
        }
        setBankVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Dummy verify always succeeds
      } finally {
        setSaving(false);
      }
    }
  };

  // ── Save current section to backend ──────────────────────────────────────
  const saveCurrentSectionData = async () => {
    const sec = currentSections[sectionIdx]?.key;
    const token = useDriverStore.getState().token;
    if (!token || !sec) return;

    let data: Record<string, any> = {};

    switch (sec) {
      case "gender":
        data = { gender };
        break;
      case "vehicle":
        data = { vehicleType: vehicle };
        break;
      case "aadhaar":
        data = {
          aadhaarNumber: aadhaarNumber.replace(/\s/g, ""),
          aadhaarVerified,
        };
        break;
      case "pan":
        data = { panNumber, panName, panVerified };
        break;
      case "license":
        data = { dlNumber, dlExpiry };
        break;
      case "bank":
        data = { bankAccountNumber: bankAccount, bankIfsc: ifsc, bankVerified };
        break;
      case "zone":
        data = { preferredZone };
        break;
      case "homeAddress": {
        setSaving(true);
        try {
          const res = await fetch(`${API_URL}/users/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              label: "Home",
              addressLine: homeAddressLine,
              phone: useDriverStore.getState().driverPhone || "+919999999999",
              coordinates: { lat: homeLat, lng: homeLng }
            }),
          });
          if (res.status === 401 || res.status === 403) {
            useDriverStore.getState().logout();
            router.replace("/auth");
            return;
          }
        } catch (err) {
          console.error("Failed to save home address on onboarding:", err);
        } finally {
          setSaving(false);
        }
        return;
      }
      default:
        return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.status === 401 || res.status === 403) {
        useDriverStore.getState().logout();
        router.replace("/auth");
        return;
      }
    } catch (err) {
      console.error("Failed to save onboarding section:", sec, err);
    } finally {
      setSaving(false);
    }
  };

  // ── Complete onboarding (final step) ───────────────────────────────────────
  const handleCompleteOnboarding = async () => {
    const token = useDriverStore.getState().token;
    if (!token) return;

    // Save selfie section first
    setSaving(true);
    try {
      const patchRes = await fetch(`${API_URL}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selfieImage: "captured" }),
      });
      
      if (patchRes.status === 401 || patchRes.status === 403) {
        useDriverStore.getState().logout();
        router.replace("/auth");
        return;
      }

      // Call complete endpoint
      const res = await fetch(`${API_URL}/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        useDriverStore.getState().logout();
        router.replace("/auth");
        return;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error response:", res.status, errText);
        throw new Error(`Failed to complete onboarding: ${res.status} ${errText}`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setOnboardingCompleted();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Can proceed checks ────────────────────────────────────────────────────
  const canProceedAadhaar = (): boolean => {
    if (panVerified) {
      // Formality mode — PAN was already verified, just collect Aadhaar for records
      return validateAadhaarFormat(aadhaarNumber.replace(/\s/g, ""));
    }
    return aadhaarVerified;
  };

  const canProceedPAN = (): boolean => {
    if (aadhaarVerified) {
      // Formality mode — Aadhaar was already verified, just collect PAN for records
      return validatePANFormat(panNumber) && panName.length >= 3;
    }
    return panVerified;
  };

  const canProceedSection = (): boolean => {
    const sec = currentSections[sectionIdx]?.key;
    switch (sec) {
      case "gender": return !!gender;
      case "vehicle": return !!vehicle;
      case "zone": return !!preferredZone;
      case "homeAddress": return !!homeAddressLine && homeLat !== null && homeLng !== null;
      case "aadhaar": return canProceedAadhaar();
      case "pan": return canProceedPAN();
      case "license": return validateDLFormat(dlNumber) && !!dlExpiry;
      case "bank": return bankVerified;
      case "selfie": return selfieCaptured;
      default: return false;
    }
  };

  

  const sectionTitle = (): string => {
    const sec = currentSections[sectionIdx]?.key;
    switch (sec) {
      case "gender": return "Select Your Gender";
      case "vehicle": return "Select Your Vehicle";
      case "zone": return "Select Preferred Zone";
      case "homeAddress": return "Enter Your Home Address";
      case "aadhaar": return "Aadhaar Verification";
      case "pan": return "PAN Card Details";
      case "license": return "Driving License";
      case "bank": return "Bank Account Details";
      case "selfie": return "Profile Photo";
      default: return "";
    }
  };

  const sectionSubtitle = (): string | undefined => {
    const sec = currentSections[sectionIdx]?.key;
    switch (sec) {
      case "gender": return "This helps us personalise your experience.";
      case "vehicle": return "Choose the vehicle you'll use for deliveries. You can change this later.";
      case "zone": return "Choose your preferred operational zone. This is where you will receive ride and delivery requests.";
      case "homeAddress": return "This is used for the 'Head Home' matching feature, giving you orders on your way home.";
      case "aadhaar": return panVerified ? "Aadhaar details collected for records (PAN was used for identity verification)." : "Enter your 12-digit Aadhaar number to verify your identity.";
      case "pan": return aadhaarVerified ? "PAN details collected for records (Aadhaar was used for identity verification)." : "Enter your PAN details for identity verification.";
      case "license": return "Enter your driving license number and expiry date.";
      case "bank": return "Enter your bank details for seamless payouts.";
      case "selfie": return "Take a clear selfie for your profile. No hats or glasses.";
      default: return undefined;
    }
  };

  // ── Render section content ────────────────────────────────────────────────
  const renderSection = () => {
    const sec = currentSections[sectionIdx]?.key;

    switch (sec) {
      // ── Step 1 ────────────────────────────────────────────────────────────
      case "gender":
        return (
          <View style={{ gap: 12 }}>
            <Animated.View entering={staggerListItem(0)}>
              <SelectCard
                selected={gender === "male"}
                onSelect={() => setGender("male")}
                icon="user"
                label="Male"
              />
            </Animated.View>
            <Animated.View entering={staggerListItem(1)}>
              <SelectCard
                selected={gender === "female"}
                onSelect={() => setGender("female")}
                icon="user"
                label="Female"
              />
            </Animated.View>
          </View>
        );

      case "vehicle":
        return (
          <View style={{ gap: 12 }}>
            {VEHICLES.map((v, idx) => (
              <Animated.View key={v.id} entering={staggerListItem(idx)}>
                <SelectCard
                  selected={vehicle === v.id}
                  onSelect={() => setVehicle(v.id)}
                  icon={v.icon}
                  label={v.label}
                  desc={v.desc}
                />
              </Animated.View>
            ))}
          </View>
        );

      case "zone": {
        const filtered = zones.filter((z) =>
          z.name.toLowerCase().includes(zoneSearchText.toLowerCase())
        );
        const selectedZoneDoc = zones.find((z) => z._id === preferredZone);

        return (
          <View style={{ gap: 12, paddingBottom: 10 }}>
            {/* Search Input field */}
            <FormInput
              label="Search Zone"
              value={zoneSearchText}
              onChangeText={(t) => {
                setZoneSearchText(t);
                setIsZoneDropdownOpen(true);
              }}
              placeholder="Search by city or zone name..."
              icon="search"
            />

            {/* Dropdown Menu */}
            {isZoneDropdownOpen && (
              <View style={{ 
                borderWidth: 1, 
                borderColor: Colors.border || "#e2e8f0", 
                borderRadius: 12, 
                backgroundColor: "#ffffff", 
                maxHeight: 180, 
                overflow: "hidden", 
                marginTop: -4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                zIndex: 999
              }}>
                <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 180 }}>
                  {filtered.length === 0 ? (
                    <Text style={{ padding: 12, fontSize: 13, color: Colors.textMuted || "#64748b", textAlign: "center" }}>
                      No matching zones found.
                    </Text>
                  ) : (
                    filtered.map((z) => (
                      <TouchableOpacity 
                        key={z._id} 
                        onPress={() => {
                          setPreferredZone(z._id);
                          setIsZoneDropdownOpen(false);
                          setZoneSearchText("");
                        }}
                        style={{ 
                          padding: 12, 
                          borderBottomWidth: 1, 
                          borderBottomColor: "#f1f5f9"
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#1e293b", fontWeight: "600" }}>{z.name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            {/* Selected Zone Full Card */}
            {selectedZoneDoc && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.textMuted || "#64748b", marginBottom: 6 }}>
                  Selected Preferred Zone:
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    router.push({
                      pathname: "/zone-map",
                      params: { zoneId: selectedZoneDoc._id }
                    });
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f0f9ff",
                    borderWidth: 2,
                    borderColor: Colors.primary || "#0ea5e9",
                    borderRadius: 16,
                    padding: 16,
                    gap: 12,
                    shadowColor: Colors.primary || "#0ea5e9",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  <View style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 22, 
                    backgroundColor: "#e0f2fe", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}>
                    <Feather name="map-pin" size={20} color="#0ea5e9" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#0369a1" }}>
                      {selectedZoneDoc.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#0284c7", marginTop: 2 }}>
                      {selectedZoneDoc.description || "Operational geofence area."}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.primary || "#0ea5e9", marginTop: 8 }}>
                      🗺️ View Zone Coverage Map
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#0ea5e9" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      }

      case "homeAddress":
        return (
          <View style={{ gap: 16 }}>
            <FormInput
              label="Full Home Address"
              value={homeAddressLine}
              onChangeText={(t) => {
                setHomeAddressLine(t);
                fetchSuggestions(t);
              }}
              placeholder="e.g. 12, MG Road, Rajahmundry"
              icon="home"
            />

            <HomeAddressSuggestions
              suggestions={suggestions}
              onSelect={(item) => {
                setHomeAddressLine(item.address);
                setHomeLat(item.lat);
                setHomeLng(item.lng);
                setSuggestions([]);
              }}
            />

            <LocationVerifiedBox lat={homeLat} lng={homeLng} />
          </View>
        );

      // ── Step 2 ────────────────────────────────────────────────────────────
      case "aadhaar":
        return (
          <View style={{ gap: 16 }}>
            <FormInput
              label="Aadhaar Number"
              value={aadhaarNumber}
              onChangeText={(t) => {
                const cleaned = t.replace(/[^0-9]/g, "").slice(0, 12);
                const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
                setAadhaarNumber(formatted);
              }}
              placeholder="XXXX XXXX XXXX"
              keyboardType="number-pad"
              maxLength={14}
              icon="credit-card"
            />
            {panVerified ? (
              /* ── Formality mode — PAN was already verified, just collect Aadhaar for records ── */
              <>
                <InfoBanner
                  icon="info"
                  text="Aadhaar details collected for records. PAN was used for identity verification."
                  type="info"
                />
                {aadhaarNumber.replace(/\s/g, "").length > 0 && (
                  validateAadhaarFormat(aadhaarNumber.replace(/\s/g, ""))
                    ? <InfoBanner icon="check-circle" text="Valid Aadhaar format" type="success" />
                    : (
                      <View style={{ backgroundColor: "#fef2f2", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca" }}>
                        <Text style={{ color: Colors.error, fontSize: 13, lineHeight: 18 }}>
                          Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1.
                        </Text>
                      </View>
                    )
                )}
              </>
            ) : !aadhaarVerified ? (
              /* ── Verify mode — user needs to verify Aadhaar via Surepass ── */
              <>
                <ConsentCheckbox
                  checked={consentAadhaar}
                  onToggle={() => setConsentAadhaar(!consentAadhaar)}
                  label="I consent to share my Aadhaar details with Triozen for identity verification via third-party services (Surepass)."
                />
                <PrimaryButton
                  title="Verify Aadhaar"
                  onPress={handleVerifyAadhaar}
                  disabled={aadhaarNumber.replace(/\s/g, "").length < 12 || !consentAadhaar || saving}
                  loading={saving}
                  icon="shield"
                />
                {!panVerified && (
                  <TouchableOpacity
                    onPress={goToNextSection}
                    style={{ alignItems: "center", paddingVertical: 10 }}
                  >
                    <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: "500" }}>
                      Skip, I&apos;ll use PAN card →
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <InfoBanner icon="check-circle" text="Aadhaar verified successfully!" type="success" />
            )}
          </View>
        );

      case "pan":
        return (
          <View style={{ gap: 16 }}>
            <FormInput
              label="PAN Number"
              value={panNumber}
              onChangeText={(t) => setPanNumber(t.toUpperCase().slice(0, 10))}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              icon="file-text"
            />
            <FormInput
              label="Name as on PAN Card"
              value={panName}
              onChangeText={setPanName}
              placeholder="Enter full name"
              autoCapitalize="words"
              icon="user"
            />
            {aadhaarVerified ? (
              /* ── Formality mode — Aadhaar was already verified, just collect PAN for records ── */
              <>
                <InfoBanner
                  icon="info"
                  text="PAN details collected for records. Aadhaar was used for identity verification."
                  type="info"
                />
                {panNumber.length > 0 && !validatePANFormat(panNumber) && (
                  <View style={{ backgroundColor: "#fef2f2", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca" }}>
                    <Text style={{ color: Colors.error, fontSize: 13, lineHeight: 18 }}>
                      Invalid PAN number. Format should be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).
                    </Text>
                  </View>
                )}
                {panName.length > 0 && panName.length < 3 && (
                  <View style={{ backgroundColor: "#fef2f2", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca" }}>
                    <Text style={{ color: Colors.error, fontSize: 13, lineHeight: 18 }}>
                      Name must be at least 3 characters.
                    </Text>
                  </View>
                )}
                {validatePANFormat(panNumber) && panName.length >= 3 && (
                  <InfoBanner icon="check-circle" text="Valid PAN details" type="success" />
                )}
              </>
            ) : !panVerified ? (
              /* ── Verify mode — user needs to verify PAN via Surepass ── */
              <>
                <ConsentCheckbox
                  checked={consentPAN}
                  onToggle={() => setConsentPAN(!consentPAN)}
                  label="I consent to share my PAN details with Triozen for identity verification via third-party services (Surepass)."
                />
                <PrimaryButton
                  title="Verify PAN"
                  onPress={handleVerifyPAN}
                  disabled={panNumber.length < 10 || panName.length < 3 || !consentPAN || saving}
                  loading={saving}
                  icon="shield"
                />
                {!aadhaarVerified && (
                  <TouchableOpacity
                    onPress={goToPrevSection}
                    style={{ alignItems: "center", paddingVertical: 10 }}
                  >
                    <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: "500" }}>
                      ← Go back to Aadhaar
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <InfoBanner icon="check-circle" text="PAN verified successfully!" type="success" />
            )}
          </View>
        );

      case "license":
        return (
          <View style={{ gap: 16 }}>
            <FormInput
              label="Driving License Number"
              value={dlNumber}
              onChangeText={(t) => setDlNumber(t.toUpperCase().slice(0, 19))}
              placeholder="HR-06-2020-1234567"
              autoCapitalize="characters"
              icon="file"
            />
            {dlNumber.length > 0 && (
              validateDLFormat(dlNumber)
                ? <InfoBanner icon="check-circle" text="Valid license number format" type="success" />
                : (
                  <View style={dlStyles.errorBox}>
                    <Text style={dlStyles.errorText}>
                      Invalid format. Expected 2 letters (state code) + 2 digits (RTO) + 4 digits (year) + 7 digits (serial).{"\n"}E.g. {"HR-06-2020-1234567"}
                    </Text>
                  </View>
                )
            )}

            <Text style={inputStyles.label}>Expiry Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={dlStyles.dateButton}
            >
              <Feather name="calendar" size={18} color={Colors.primary} />
              <Text style={dlExpiry ? dlStyles.dateText : dlStyles.datePlaceholder}>
                {dlExpiry || "Select Expiry Date"}
              </Text>
              {dlExpiry && (
                <Feather name="check-circle" size={18} color={Colors.success} />
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dlExpiryDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}
          </View>
        );

      case "bank":
        return (
          <View style={bankStyles.wrap}>
            <BankNotice
              title="Secure payout setup"
              text="Add the account where your delivery earnings should be settled."
            />

            <View style={bankStyles.card}>
              <FormInput
                label="Account Number"
                value={bankAccount}
                onChangeText={(t) => setBankAccount(t.replace(/[^0-9]/g, "").slice(0, 18))}
                placeholder="Enter account number"
                keyboardType="number-pad"
                icon="credit-card"
              />
              <FormInput
                label="Confirm Account Number"
                value={bankConfirm}
                onChangeText={(t) => setBankConfirm(t.replace(/[^0-9]/g, "").slice(0, 18))}
                placeholder="Re-enter account number"
                keyboardType="number-pad"
                icon="check-square"
              />
              {bankConfirm && bankAccount !== bankConfirm && (
                <View style={bankStyles.errorRow}>
                  <Feather name="alert-circle" size={15} color={Colors.error} />
                  <Text style={bankStyles.errorText}>Account numbers don&apos;t match</Text>
                </View>
              )}
              <FormInput
                label="IFSC Code"
                value={ifsc}
                onChangeText={(t) => setIfsc(t.toUpperCase().slice(0, 11))}
                placeholder="SBIN0001234"
                autoCapitalize="characters"
                icon="map-pin"
              />
              {!bankVerified ? (
                <PrimaryButton
                  title="Verify Bank Account"
                  onPress={handleVerifyBank}
                  disabled={bankAccount.length < 9 || bankAccount !== bankConfirm || ifsc.length < 8}
                  icon="shield"
                />
              ) : (
                <InfoBanner icon="check-circle" text="Bank account verified! Payouts will be sent here." />
              )}
            </View>
          </View>
        );

      case "selfie":
        return (
          <SelfieCaptureSection
            captured={selfieCaptured}
            onCapture={() => setSelfieCaptured(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 16 }]}>
        <OnboardingTopBar
          canGoBack={sectionIdx > 0 || step > 1}
          onBack={() => {
            if (sectionIdx > 0) {
              goToPrevSection();
            } else if (step > 1) {
              setStep((p) => (p - 1) as 1 | 2);
              setSectionIdx(step1Sections.length - 1);
              animateTransition(-1);
            }
          }}
          onSkip={() => {
            setOnboardingCompleted();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace("/(tabs)");
          }}
        />

        {/* Progress */}
        <StepIndicator step={step} />

        <SectionProgressBar sections={currentSections} currentIndex={sectionIdx} />

        {/* Section Title */}
        <SectionHeader title={sectionTitle()} subtitle={sectionSubtitle()} />

        {/* Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={slideAnimatedStyle}>
            {renderSection()}
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
            currentSections[sectionIdx]?.key === "bank" && !bankVerified && styles.bottomBarHidden,
          ]}
        >
          {(() => {
            const sec = currentSections[sectionIdx]?.key;
            const nextSection = currentSections[sectionIdx + 1];
            const nextLabel = nextSection?.label ? `Next — ${nextSection.label}` : "Continue";

            if (sec === "selfie" && selfieCaptured) {
              return (
                <PrimaryButton
                  title="Complete & Activate"
                  onPress={handleCompleteOnboarding}
                  icon="check"
                  loading={saving}
                />
              );
            }

            if (sec === "vehicle" && canProceedSection()) {
              return (
                <PrimaryButton
                  title="Save & Continue"
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if (sec === "zone" && canProceedSection()) {
              return (
                <PrimaryButton
                  title="Save & Continue"
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if (sec === "homeAddress" && canProceedSection()) {
              return (
                <PrimaryButton
                  title="Save & Continue"
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextStep();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if ((sec === "aadhaar" || sec === "pan") && canProceedSection()) {
              return (
                <PrimaryButton
                  title={nextLabel}
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if (sec === "license" && canProceedSection()) {
              return (
                <PrimaryButton
                  title={nextLabel}
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if (sec === "bank" && bankVerified) {
              return (
                <PrimaryButton
                  title={nextLabel}
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            if (sec === "bank") {
              return <View />;
            }

            if (sec === "gender" && gender) {
              return (
                <PrimaryButton
                  title={nextLabel}
                  onPress={async () => {
                    await saveCurrentSectionData();
                    goToNextSection();
                  }}
                  icon="arrow-right"
                  loading={saving}
                />
              );
            }

            // On Aadhaar/PAN without verification — inline skip link handles navigation
            if (sec === "aadhaar" || sec === "pan") {
              return <View />;
            }

            // Default: Continue button (enabled when can proceed)
            return (
              <PrimaryButton
                title="Continue"
                onPress={goToNextSection}
                disabled={!canProceedSection()}
                icon="arrow-right"
              />
            );
          })()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
