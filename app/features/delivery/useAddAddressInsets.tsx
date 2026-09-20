import { useState, useRef, useMemo } from "react";
import { TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/contexts/authStore";
import MapView from "@/components/maps";
import { createStyles } from "./add-address.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// Split out of useAddAddress so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddAddressInsets() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isEditMode = !!(params.editId && String(params.editId).length > 0);

  const [selectedChip, setSelectedChip] = useState<"Home" | "Work" | "Other">("Home");
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const [phone] = useState(String(params.phone || ""));
  const [receiverName, setReceiverName] = useState(String(params.receiverName || ""));
  const [receiverPhone, setReceiverPhone] = useState(String(params.receiverPhone || ""));
  const [landmark, setLandmark] = useState(String(params.landmark || ""));
  const [shortAddress, setShortAddress] = useState("Select location");
  const [cityOrCountry, setCityOrCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(params.step === "1" ? 1 : 2);
  const [region, setRegion] = useState({ latitude: 17.4447, longitude: 78.3498, latitudeDelta: 0.005, longitudeDelta: 0.005 });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const isMapReady = useRef(false);

  const latLabel = region.latitude.toFixed(6);

  return { insets, router, params, mapRef, searchInputRef, tokens, accent, styles, user, setUser, isEditMode, selectedChip, setSelectedChip, label, setLabel, addressLine, setAddressLine, completeAddress, setCompleteAddress, instructions, setInstructions, phone, receiverName, setReceiverName, receiverPhone, setReceiverPhone, landmark, setLandmark, shortAddress, setShortAddress, cityOrCountry, setCityOrCountry, loading, setLoading, step, setStep, region, setRegion, searchQuery, setSearchQuery, searchResults, setSearchResults, searching, setSearching, userCoords, setUserCoords, isResolvingAddress, setIsResolvingAddress, isMapReady, latLabel };
}
