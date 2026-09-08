import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useGoogleMaps } from "../../../hooks/useGoogleMaps";
import { apiFetch } from "../../../lib/api-client";
import { parseCsvRows, parseXlsxRows } from "../../../lib/spreadsheet";
import { STEPS, PARTNER_COPY, CUISINE_OPTIONS, MEAT_CATEGORY_OPTIONS, DAYS, MENU_UPLOAD_COLUMNS } from "../constants";
import type { PartnerType, MenuItem, MenuCategory, UploadedMenuRow, DayTimeSlots } from "../types";

const createDefaultDayTimeSlots = (): DayTimeSlots =>
  DAYS.reduce((acc, day) => {
    acc[day] = [{ open: "09:00", close: "22:00" }];
    return acc;
  }, {} as DayTimeSlots);

export function useOnboardingForm() {
  const [searchParams] = useSearchParams();
  const partnerType: PartnerType = searchParams.get("type") === "meat" ? "meat" : "food";
  const isMeatPartner = partnerType === "meat";
  const copy = PARTNER_COPY[partnerType];
  const categoryOptions = isMeatPartner ? MEAT_CATEGORY_OPTIONS : CUISINE_OPTIONS;
  const onboardingSteps = STEPS.map((stepItem) =>
    stepItem.num === 1
      ? { ...stepItem, label: copy.infoTitle }
      : stepItem.num === 2
        ? { ...stepItem, label: isMeatPartner ? "Operational Details" : stepItem.label }
        : stepItem
  );
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const isMapsLoaded = useGoogleMaps(mapsApiKey);

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [mapView, setMapView] = useState<"map" | "satellite">("map");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const sublocality = addr.suburb || addr.neighbourhood || addr.village || "";
        const cityVal = addr.city || addr.town || addr.county || "";
        const landmarkVal = addr.amenity || addr.shop || addr.road || "";
        const shopNoVal = addr.house_number || "";

        const areaName = [sublocality, addr.subdistrict].filter(Boolean).join(", ");
        if (areaName) setArea(areaName);
        if (cityVal) setCity(cityVal);
        if (landmarkVal) setLandmark(landmarkVal);
        if (shopNoVal) setShopNo(shopNoVal);

        if (data.display_name) {
          setLocationSearch(data.display_name);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  const parseAddressComponents = (place: any) => {
    let streetNo = "";
    let route = "";
    let locality = "";
    let sublocality = "";
    let currentCity = "";
    let state = "";
    let country = "";
    let postalCode = "";

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes("street_number")) streetNo = component.long_name;
        if (types.includes("route")) route = component.long_name;
        if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
          sublocality = component.long_name;
        }
        if (types.includes("locality")) locality = component.long_name;
        if (types.includes("administrative_area_level_2")) currentCity = component.long_name;
        if (types.includes("administrative_area_level_1")) state = component.long_name;
        if (types.includes("country")) country = component.long_name;
        if (types.includes("postal_code")) postalCode = component.long_name;
      }
    }

    const areaName = [sublocality, locality].filter(Boolean).join(", ");
    if (areaName) setArea(areaName);

    const resolvedCity = locality || currentCity;
    if (resolvedCity) setCity(resolvedCity);

    if (streetNo || route) {
      setShopNo([streetNo, route].filter(Boolean).join(" "));
    }

    if (place.formatted_address) {
      setLocationSearch(place.formatted_address);
    }
  };

  useEffect(() => {
    if (!isMapsLoaded || !mapRef.current) return;

    if (mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const defaultLat = parseFloat(gpsLat) || 16.932539;
    const defaultLng = parseFloat(gpsLng) || 81.752708;
    const tileUrl = mapView === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([defaultLat, defaultLng], 15);

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    const customIcon = L.divIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 30px; height: 30px; transform: translate(-3px, -15px);">
          <div style="width: 14px; height: 14px; background-color: var(--color-map-marker); border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"></div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid var(--color-map-marker); margin-top: -1px;"></div>
        </div>
      `,
      className: "custom-leaflet-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      const newLat = pos.lat.toFixed(6);
      const newLng = pos.lng.toFixed(6);
      setGpsLat(newLat);
      setGpsLng(newLng);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e: any) => {
      if (e.latlng) {
        marker.setLatLng(e.latlng);
        const newLat = e.latlng.lat.toFixed(6);
        const newLng = e.latlng.lng.toFixed(6);
        setGpsLat(newLat);
        setGpsLng(newLng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      }
    });

    const google = (window as any).google;
    if (google && searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ["geocode", "establishment"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const loc = place.geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        setGpsLat(lat.toFixed(6));
        setGpsLng(lng.toFixed(6));

        map.setView([lat, lng], 17);
        marker.setLatLng([lat, lng]);

        parseAddressComponents(place);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [isMapsLoaded]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = mapView === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [mapView]);

  // ── Step 1: Restaurant Information ──────────────────────────────────────

  const [restaurantName, setRestaurantName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [confirmPortalPassword, setConfirmPortalPassword] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [primaryContact, setPrimaryContact] = useState("");
  const [sameAsOwner, setSameAsOwner] = useState(true);

  const [gpsLat, setGpsLat] = useState("");
  const [gpsLng, setGpsLng] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const [shopNo, setShopNo] = useState("");
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");

  const toggleCuisine = (c: string) => {
    setCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const sendOtp = () => {
    if (ownerPhone.length >= 10) setOtpSent(true);
  };

  const verifyOtp = () => {
    if (otp === "1234") {
      setOtpVerified(true);
    } else {
      alert("Invalid OTP! Please enter code '1234' for verification.");
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const latStr = lat.toFixed(6);
          const lngStr = lng.toFixed(6);
          setGpsLat(latStr);
          setGpsLng(lngStr);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 17);
            markerInstanceRef.current.setLatLng([lat, lng]);
          }

          reverseGeocode(lat, lng);
        },
        () => alert("Unable to retrieve your location. Please search manually.")
      );
    }
  };

  const handleMapZoom = (direction: "in" | "out") => {
    if (!mapInstanceRef.current) return;
    if (direction === "in") {
      mapInstanceRef.current.zoomIn();
    } else {
      mapInstanceRef.current.zoomOut();
    }
  };

  // ── Step 2: Menu & Operational Details ──────────────────────────────────

  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [activeTimingDay, setActiveTimingDay] = useState("Monday");
  const [dayTimeSlots, setDayTimeSlots] = useState<DayTimeSlots>(() => createDefaultDayTimeSlots());

  // Menu Builder State
  const [menuSetupMode, setMenuSetupMode] = useState<"upload" | "manual">("manual");
  const [menuReferenceFile, setMenuReferenceFile] = useState<File | null>(null);
  const [menuUploadValid, setMenuUploadValid] = useState(false);
  const [menuUploadError, setMenuUploadError] = useState("");
  const [menuUploadRows, setMenuUploadRows] = useState<UploadedMenuRow[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [editingItem, setEditingItem] = useState<{ categoryId: string; item?: MenuItem } | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      if (!next.includes(activeTimingDay)) {
        setActiveTimingDay(next[0] || day);
      }
      return next;
    });
  };

  const addTimeSlot = (day = activeTimingDay) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { open: "09:00", close: "22:00" }],
    }));
  };

  const removeTimeSlot = (day: string, i: number) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, idx) => idx !== i),
    }));
  };

  const updateTimeSlot = (day: string, i: number, key: "open" | "close", val: string) => {
    setDayTimeSlots((prev) => {
      const updated = [...(prev[day] || [])];
      updated[i] = { ...updated[i], [key]: val };
      return { ...prev, [day]: updated };
    });
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setMenuCategories((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, items: [] },
    ]);
    setNewCategoryName("");
    setShowCategoryDialog(false);
  };

  const validateMenuReferenceFile = async (file: File | null) => {
    setMenuReferenceFile(file);
    setMenuUploadValid(false);
    setMenuUploadError("");
    setMenuUploadRows([]);

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx"].includes(extension || "")) {
      setMenuUploadError("Upload a CSV or XLSX menu sheet.");
      return;
    }

    try {
      const rows = extension === "csv" ? await parseCsvRows(file, MENU_UPLOAD_COLUMNS) : await parseXlsxRows(file, MENU_UPLOAD_COLUMNS);
      setMenuUploadRows(rows);
      setMenuUploadValid(true);
    } catch (err: any) {
      setMenuUploadError(err?.message || "Unable to read the uploaded menu sheet.");
      setMenuUploadValid(false);
    }
  };

  const updateMenuUploadRowImage = (rowId: string, image: File | null) => {
    setMenuUploadRows((rows) =>
      rows.map((row) => row.id === rowId ? { ...row, image } : row)
    );
  };

  // ── Step 3: Documents & Legal ───────────────────────────────────────────

  const [panNumber, setPanNumber] = useState("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [gstin, setGstin] = useState("");
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [gstExempt, setGstExempt] = useState(false);

  const [fssaiNumber, setFssaiNumber] = useState("");
  const [fssaiExpiry, setFssaiExpiry] = useState("");
  const [fssaiFile, setFssaiFile] = useState<File | null>(null);

  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current">("savings");
  const [ifsc, setIfsc] = useState("");
  const [ifscFetched, setIfscFetched] = useState(false);
  const [chequeFile, setChequeFile] = useState<File | null>(null);

  const fetchBankDetails = () => {
    if (ifsc.length === 11) {
      // Simulate IFSC auto-fetch
      setIfscFetched(true);
    }
  };

  // ── Step 4: Contract & Review ───────────────────────────────────────────

  const [acceptedTos, setAcceptedTos] = useState(false);
  const [signature, setSignature] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────

  const canProceedStep1 = () => {
    return (
      restaurantName.length > 0 &&
      cuisines.length > 0 &&
      ownerName.length > 0 &&
      ownerEmail.includes("@") &&
      portalPassword.length >= 6 &&
      portalPassword === confirmPortalPassword &&
      otpVerified &&
      area.length > 0 &&
      city.length > 0 &&
      landmark.length > 0
    );
  };

  const canProceedStep2 = () => {
    const timingsComplete = selectedDays.length > 0 && selectedDays.every((day) =>
      (dayTimeSlots[day] || []).some((slot) => slot.open && slot.close)
    );

    if (!timingsComplete) return false;
    if (isMeatPartner) return true;

    if (menuSetupMode === "upload") {
      return menuReferenceFile !== null && menuUploadValid && menuUploadRows.length > 0 && menuUploadRows.every((row) => row.image);
    }
    return menuCategories.length > 0 && menuCategories.some((c) => c.items.length > 0);
  };

  const canProceedStep3 = () => {
    return (
      panNumber.length >= 10 &&
      panFile !== null &&
      (gstExempt || (gstin.length > 0 && gstFile !== null)) &&
      fssaiNumber.length === 14 &&
      fssaiExpiry.length > 0 &&
      fssaiFile !== null &&
      bankAccount.length >= 9 &&
      bankAccount === bankConfirm &&
      ifsc.length === 11 &&
      ifscFetched &&
      chequeFile !== null
    );
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getPayload = (status: "draft" | "submitted") => {
    const selectedDayTimeSlots: Record<string, { open: string; close: string }[]> = {};
    selectedDays.forEach((day) => {
      selectedDayTimeSlots[day] = dayTimeSlots[day] || [];
    });

    return {
      status,
      partnerType,
      restaurantName,
      cuisines,
      ownerName,
      ownerEmail,
      portalPassword,
      ownerPhone,
      otp: otp || "1234",
      otpVerified,
      primaryContact: sameAsOwner ? ownerPhone : primaryContact,
      sameAsOwner,
      location: {
        lat: gpsLat ? parseFloat(gpsLat) : undefined,
        lng: gpsLng ? parseFloat(gpsLng) : undefined,
      },
      address: {
        shopNo,
        floor,
        area,
        city,
        landmark,
      },
      selectedDays,
      dayTimeSlots: selectedDayTimeSlots,
      menuSetupMode,
      menuReferenceFile: menuReferenceFile ? { name: menuReferenceFile.name } : null,
      menuUploadValid,
      menuUploadRows: menuUploadRows.map((row) => ({
        category: row.category,
        itemName: row.itemName,
        price: row.price,
        description: row.description,
        type: row.type,
        isBestseller: row.isBestseller,
        image: row.image ? { name: row.image.name } : null,
      })),
      menuCategories: menuCategories.map((category) => ({
        name: category.name,
        items: category.items.map((item) => ({
          name: item.name,
          price: item.price,
          description: item.description,
          isVeg: item.isVeg,
          isBestseller: item.isBestseller,
          photo: item.photo ? { name: item.photo.name } : null,
        })),
      })),
      panNumber,
      panFile: panFile ? { name: panFile.name } : null,
      gstin,
      gstFile: gstFile ? { name: gstFile.name } : null,
      gstExempt,
      fssaiNumber,
      fssaiExpiry,
      fssaiFile: fssaiFile ? { name: fssaiFile.name } : null,
      bankAccount,
      bankConfirm,
      accountType,
      ifsc,
      ifscFetched,
      chequeFile: chequeFile ? { name: chequeFile.name } : null,
      acceptedTos,
      signature,
    };
  };

  const handleSaveDraft = async () => {
    if (!saveEmail.includes("@")) return;
    setIsSaving(true);
    try {
      await apiFetch("/vendors/onboarding", {
        method: "POST",
        body: JSON.stringify(getPayload("draft")),
      });
      setDraftSaved(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setDraftSaved(false);
      }, 2500);
    } catch (err: any) {
      alert("Error saving draft: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch("/vendors/onboarding", {
        method: "POST",
        body: JSON.stringify(getPayload("submitted")),
      });
      setSubmitted(true);
    } catch (err: any) {
      alert("Error submitting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    partnerType, isMeatPartner, copy, categoryOptions, onboardingSteps,
    step, setStep, submitted, setSubmitted, showSaveModal, setShowSaveModal, saveEmail, setSaveEmail, draftSaved, setDraftSaved,
    isMapsLoaded, mapRef, searchInputRef, mapInstanceRef, markerInstanceRef, tileLayerRef, mapView, setMapView, isSaving, isSubmitting,
    handleUseCurrentLocation, handleMapZoom,
    restaurantName, setRestaurantName, cuisines, setCuisines,
    ownerName, setOwnerName, ownerEmail, setOwnerEmail, portalPassword, setPortalPassword, confirmPortalPassword, setConfirmPortalPassword,
    ownerPhone, setOwnerPhone, otpSent, setOtpSent, otp, setOtp, otpVerified, setOtpVerified, primaryContact, setPrimaryContact, sameAsOwner, setSameAsOwner,
    gpsLat, gpsLng, locationSearch, setLocationSearch,
    shopNo, setShopNo, floor, setFloor, area, setArea, city, setCity, landmark, setLandmark,
    toggleCuisine, sendOtp, verifyOtp,
    selectedDays, setSelectedDays, activeTimingDay, setActiveTimingDay, dayTimeSlots,
    menuSetupMode, setMenuSetupMode, menuReferenceFile, menuUploadValid, menuUploadError, menuUploadRows, menuCategories, setMenuCategories,
    editingItem, setEditingItem, showCategoryDialog, setShowCategoryDialog, newCategoryName, setNewCategoryName,
    toggleDay, addTimeSlot, removeTimeSlot, updateTimeSlot, addCategory, validateMenuReferenceFile, updateMenuUploadRowImage,
    panNumber, setPanNumber, panFile, setPanFile, gstin, setGstin, gstFile, setGstFile, gstExempt, setGstExempt,
    fssaiNumber, setFssaiNumber, fssaiExpiry, setFssaiExpiry, fssaiFile, setFssaiFile,
    bankAccount, setBankAccount, bankConfirm, setBankConfirm, accountType, setAccountType, ifsc, setIfsc, ifscFetched, setIfscFetched, chequeFile, setChequeFile,
    fetchBankDetails,
    acceptedTos, setAcceptedTos, signature, setSignature,
    canProceedStep1, canProceedStep2, canProceedStep3,
    handleNext, handleBack, handleSaveDraft, handleFinalSubmit,
  };
}
