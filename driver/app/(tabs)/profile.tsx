import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { DriverTabBar, useDriverTabBarHeight } from "@/components/shared/DriverTabBar";
import { useDriverStore } from "@/store/driverStore";
import {
  available,
  field,
  formatCoordinates,
  formatDate,
  formatMonthYear,
  yesNo,
} from "@/features/profile/utils/format";

import { fadeInUp } from "@/motion/presets";
import {
  AccountMenuList,
  CurrentVehicleRow,
  DocumentStatusCard,
  ProfileHeaderCard,
  ProfileLoadingCard,
  ProfileSectionModal,
  ProfileStatsCard,
  ProfileUnavailableCard,
  RetakeOnboardingButton,
  SignOutButton,
  SectionFieldRows,
} from "@/features/profile/components";
import {
  BankSection,
  DocumentsSection,
  PersonalSection,
  SettingsSection,
  SupportSection,
  VehicleSection,
} from "@/features/profile/components/sections";
import { styles } from "@/features/profile/profile-tab.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";

type Status = "valid" | "expired" | "pending";

interface BankAccountInfo {
  accountNumber: string;
  ifsc: string;
  verified: boolean;
  isDefault: boolean;
}

interface ProfileResponse {
  account: {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    phone: string;
    profilePic: string | null;
    role: string;
    defaultLocation: { type: string; coordinates: number[] } | null;
    addresses: { label: string; receiverName?: string; addressLine: string; phone: string }[];
    createdAt: string;
    updatedAt: string;
  };
  driver: {
    id: string;
    status: string;
    isAvailable: boolean;
    currentLocation: { type: string; coordinates: number[] } | null;
    onboardingStatus: string;
    onboardingCompletedAt: string | null;
    gender: string | null;
    vehicleType: string | null;
    aadhaarNumber: string | null;
    aadhaarVerified: boolean;
    panNumber: string | null;
    panImage: string | null;
    dlNumber: string | null;
    dlExpiry: string | null;
    dlFrontImage: string | null;
    dlBackImage: string | null;
    bankAccountNumber: string | null;
    bankIfsc: string | null;
    bankVerified: boolean;
    bankAccounts?: BankAccountInfo[];
    selfieImage: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  verification: {
    identity: boolean;
    drivingLicense: Status;
    bank: boolean;
    selfie: boolean;
    documentsComplete: boolean;
  };
  vehicle: {
    type: string | null;
    label: string;
    insuranceStatus: Status;
  };
  stats: {
    completedTrips: number;
    rating: number;
    acceptanceRate: number;
  };
}

const emptyProfile: ProfileResponse | null = null;

// ─── GENDER OPTIONS ───────────────────────────────────────────────────────────
const GENDERS = [
  { id: "male", label: "Male", icon: "user" as const },
  { id: "female", label: "Female", icon: "user" as const },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProfileScreen() {
  const tabBarHeight = useDriverTabBarHeight();
  const token = useDriverStore((s) => s.token);
  const logout = useDriverStore((s) => s.logout);
  const resetOnboarding = useDriverStore((s) => s.resetOnboarding);
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);
  const [profile, setProfile] = useState<ProfileResponse | null>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Edit form state ──────────────────────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState<string | null>(null);

  // ── Change password state ────────────────────────────────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ── Add bank account state ───────────────────────────────────────────────
  const [showBankForm, setShowBankForm] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState("");
  const [newBankIfsc, setNewBankIfsc] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);

  const loadProfile = useCallback(async (refreshing = false) => {
    if (!apiUrl || !token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only a rejected token signs the driver out. A 404 means the request
      // missed the route (wrong EXPO_PUBLIC_API_URL / stale build), which is a
      // config problem — surface it instead of destroying a valid session.
      if (response.status === 401 || response.status === 403) {
        logout();
        router.replace("/auth");
        return;
      }
      if (response.status === 404) {
        throw new Error("Profile service unavailable. Please try again shortly.");
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load profile");
      setProfile(data);
      if (data.verification?.identity != null) {
        setIdentityVerified(data.verification.identity);
      }
    } catch (error: any) {
      Alert.alert("Profile unavailable", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initials = useMemo(() => {
    const name = profile?.account.name || "Driver";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.account.name]);

  // ── Enter edit mode ──────────────────────────────────────────────────────
  const handleStartEditing = () => {
    if (!profile) return;
    setEditName(profile.account.name || "");
    setEditUsername(profile.account.username || "");
    setEditEmail(profile.account.email || "");
    setEditPhone(profile.account.phone || "");
    setEditGender(profile.driver?.gender || null);
    setIsEditing(true);
  };

  // ── Save edited personal info ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!token) return;
    if (!editName.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, string> = { name: editName.trim() };
      if (editUsername.trim()) body.username = editUsername.trim();
      if (editEmail.trim()) body.email = editEmail.trim();
      if (editPhone.trim()) body.phone = editPhone.trim();
      if (editGender) body.gender = editGender;

      const response = await fetch(`${apiUrl}/drivers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");

      setProfile(data.profile);
      setIsEditing(false);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!token) return;
    if (!currentPassword || !newPassword) {
      Alert.alert("Validation", "Fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch(`${apiUrl}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to change password");

      Alert.alert("Success", "Password changed successfully.");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Add bank account ─────────────────────────────────────────────────────
  const handleAddBankAccount = async () => {
    if (!token) return;
    if (newBankAccount.length < 9 || newBankIfsc.length < 8) {
      Alert.alert("Validation", "Enter valid bank account and IFSC code");
      return;
    }

    setIsSavingBank(true);
    try {
      // Use the onboarding PATCH endpoint to add a bank account
      const response = await fetch(`${apiUrl}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankAccountNumber: newBankAccount,
          bankIfsc: newBankIfsc,
          bankVerified: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to add bank account");
      }

      // Reload profile to show new account
      await loadProfile();
      setShowBankForm(false);
      setNewBankAccount("");
      setNewBankIfsc("");
      Alert.alert("Added", "Bank account added successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add bank account");
    } finally {
      setIsSavingBank(false);
    }
  };

  // ── Handle selecting gender in edit mode ─────────────────────────────────
  const handleGenderSelect = (gender: string) => {
    setEditGender(gender);
  };

  // ── Sections data ────────────────────────────────────────────────────────
  const sections = useMemo(() => {
    if (!profile) return [];
    const driver = profile.driver;

    return [
      {
        key: "personal",
        icon: "user" as const,
        title: "Personal Info",
        subtitle: profile.account.phone,
        fields: [
          field("Name", profile.account.name),
          field("Username", profile.account.username),
          field("Email", profile.account.email),
          field("Phone", profile.account.phone),
          field("Gender", driver?.gender),
          field("Member Since", formatMonthYear(profile.account.createdAt)),
        ],
      },
      {
        key: "documents",
        icon: "file-text" as const,
        title: "Document Center",
        subtitle: profile.verification.documentsComplete
          ? "All required documents complete"
          : "Some documents are pending",
        fields: [
          field("Onboarding Status", driver?.onboardingStatus),
          field("Aadhaar", driver?.aadhaarNumber),
          field("Aadhaar Verified", yesNo(driver?.aadhaarVerified)),
          field("PAN", driver?.panNumber),
          field("Driving License", driver?.dlNumber),
          field("DL Expiry", formatDate(driver?.dlExpiry)),
          field("DL Status", profile.verification.drivingLicense),
          field("Selfie", available(driver?.selfieImage)),
        ],
      },
      {
        key: "vehicle",
        icon: "truck" as const,
        title: "Vehicle Details",
        subtitle: profile.vehicle.label,
        fields: [
          field("Vehicle Type", profile.vehicle.label),
          field("Insurance Status", profile.vehicle.insuranceStatus),
          field("Driver Status", driver?.status),
        ],
      },
      {
        key: "bank",
        icon: "credit-card" as const,
        title: "Payout Settings",
        subtitle: profile.verification.bank
          ? "Bank account ready for cash out"
          : "Add a bank account for payouts",
        fields: [
          field("Bank Account", driver?.bankAccountNumber),
          field("IFSC", driver?.bankIfsc),
          field("Bank Verified", yesNo(driver?.bankVerified)),
        ],
      },
      {
        key: "address",
        icon: "map-pin" as const,
        title: "Saved Addresses",
        subtitle: `${profile.account.addresses?.length || 0} saved addresses`,
        fields: [],
      },
      {
        key: "notifications",
        icon: "bell" as const,
        title: "Notifications",
        subtitle: "Jobs, chat, payouts and account updates",
        fields: [],
      },
      {
        key: "settings",
        icon: "settings" as const,
        title: "Settings",
        subtitle: "Account preferences",
        fields: [
          field("Default Location", formatCoordinates(profile.account.defaultLocation?.coordinates)),
          field("Saved Addresses", String(profile.account.addresses.length)),
          field("Member Since", formatDate(profile.account.createdAt)),
        ],
      },
      {
        key: "support",
        icon: "message-circle" as const,
        title: "Support",
        subtitle: "Get help with your account",
        fields: [
          field("Phone", profile.account.phone),
          field("Email", profile.account.email || "Not added"),
          field("Completed Trips", String(profile.stats.completedTrips)),
        ],
      },
    ];
  }, [profile]);

  const selectedSection = sections.find((section) => section.key === activeSection);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const handleCloseModal = () => {
    setActiveSection(null);
    setIsEditing(false);
    setShowPasswordForm(false);
    setShowBankForm(false);
    setNewBankAccount("");
    setNewBankIfsc("");
  };

  // ── Render modal content by section ──────────────────────────────────────
  const renderSectionContent = () => {
    if (!selectedSection) return null;
    const fields = selectedSection.fields;

    switch (selectedSection.key) {
      case "personal":
        return (
          <PersonalSection
            fields={fields}
            isEditing={isEditing}
            values={{
              name: editName,
              username: editUsername,
              email: editEmail,
              phone: editPhone,
            }}
            onChange={(field, value) => {
              if (field === "name") setEditName(value);
              else if (field === "username") setEditUsername(value);
              else if (field === "email") setEditEmail(value);
              else setEditPhone(value);
            }}
            genders={GENDERS}
            selectedGender={editGender}
            onSelectGender={handleGenderSelect}
            isSaving={isSaving}
            onStartEditing={handleStartEditing}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        );

      case "documents":
        return (
          <DocumentsSection
            fields={fields}
            hasPan={Boolean(profile?.driver?.panNumber)}
            hasLicense={Boolean(profile?.driver?.dlNumber)}
            onAddPan={() => {
              handleCloseModal();
              router.push("/identity-verify");
            }}
            onAddLicense={() => {
              handleCloseModal();
              router.push("/onboarding");
            }}
          />
        );

      case "vehicle":
        return <VehicleSection fields={fields} />;

      case "bank":
        return (
          <BankSection
            fields={fields}
            accounts={profile?.driver?.bankAccounts || []}
            showForm={showBankForm}
            accountNumber={newBankAccount}
            onAccountNumberChange={(t) => setNewBankAccount(t.replace(/[^0-9]/g, "").slice(0, 18))}
            ifsc={newBankIfsc}
            onIfscChange={(t) => setNewBankIfsc(t.toUpperCase().slice(0, 11))}
            isSaving={isSavingBank}
            onOpenForm={() => setShowBankForm(true)}
            onCancel={() => {
              setShowBankForm(false);
              setNewBankAccount("");
              setNewBankIfsc("");
            }}
            onSubmit={handleAddBankAccount}
          />
        );

      case "settings":
        return (
          <SettingsSection
            fields={fields}
            addresses={profile?.account.addresses || []}
            showPasswordForm={showPasswordForm}
            currentPassword={currentPassword}
            onCurrentPasswordChange={setCurrentPassword}
            newPassword={newPassword}
            onNewPasswordChange={setNewPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
            isSaving={isSavingPassword}
            onOpenForm={() => setShowPasswordForm(true)}
            onCancel={() => {
              setShowPasswordForm(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            onSubmit={handleChangePassword}
          />
        );

      case "support":
        return <SupportSection fields={fields} />;

      default:
        return <SectionFieldRows fields={fields} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LinearGradient
        colors={[Colors.brandSkin, Colors.background]}
        style={styles.headerGradient}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadProfile(true)} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ProfileLoadingCard />
        ) : !profile ? (
          <ProfileUnavailableCard message="Profile data is not available." />
        ) : (
          <>
            <ProfileHeaderCard
              name={profile.account.name}
              initials={initials}
              profilePic={profile.account.profilePic}
              memberSince={formatMonthYear(profile.account.createdAt)}
              rating={profile.stats.rating}
            />

            <ProfileStatsCard
              stats={[
                { value: String(profile.stats.completedTrips), label: "Trips" },
                { value: `${profile.stats.acceptanceRate}%`, label: "Acceptance" },
                { value: profile.driver?.status === "online" ? "ONLINE" : "OFFLINE", label: "Status" },
              ]}
            />

            <Animated.View entering={fadeInUp(120)} style={styles.docsRow}>
              <DocumentStatusCard
                icon="file-text"
                title="Driving License"
                status="Expired"
                tone={Colors.error}
                toneSurface={Colors.errorLight}
              />
              <DocumentStatusCard
                icon="shield"
                title="Vehicle Insurance"
                status="Valid"
                tone={Colors.success}
                toneSurface={Colors.successLight}
              />
            </Animated.View>

            <CurrentVehicleRow
              label="Current Vehicle"
              detail={`${profile.vehicle.label} • *********4567`}
              onPress={() => setActiveSection("vehicle")}
            />

            <Text style={styles.sectionHeader}>Account</Text>

            <AccountMenuList
              entries={sections}
              onSelect={(item) => {
                if (item.key === "support") {
                  router.push("/support");
                } else if (item.key === "address") {
                  router.push("/saved-addresses");
                } else if (item.key === "notifications") {
                  router.push("/notifications");
                } else {
                  setActiveSection(item.key);
                }
              }}
            />

            <SignOutButton onPress={handleLogout} />

            <RetakeOnboardingButton
              onPress={() => {
                resetOnboarding();
                router.replace("/onboarding");
              }}
            />
          </>
        )}
      </ScrollView>

      <DriverTabBar active="profile" />

      <ProfileSectionModal
        visible={Boolean(selectedSection)}
        title={selectedSection?.title}
        onClose={handleCloseModal}
      >
        {renderSectionContent()}
      </ProfileSectionModal>
    </SafeAreaView>
  );
}
