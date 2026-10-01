import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Vendor from "../../database/models/Vendor";
import OTP from "../../database/models/OTP";
import { sendEmail, generateOTP, getOTPEmailHtml } from "../../services/email.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { ZonesService } from "../zones/zones.service";
import { PaymentService } from "../payments/payment.service";
import VendorPayout, { VendorPayoutStatus } from "../../database/models/VendorPayout";
import Order, { OrderStatus } from "../../database/models/Order";
import { RazorpayXError } from "../payments/razorpayx.client";
import { applyRazorpayXPayout } from "../payments/payout.status";
import FoodItem from "../../database/models/FoodItem";
import { evaluateOutletOpenState } from "../../utils/openingHours";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSearchTokens = (term: string) => term.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);

const matchesAnyToken = (value: unknown, tokens: string[]) => {
  if (typeof value !== "string" || !value) return false;
  const haystack = value.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
};

/** Vendor identity match — name, cuisines and address. */
const vendorTextMatches = (vendor: any, tokens: string[]) =>
  matchesAnyToken(vendor?.name, tokens) ||
  matchesAnyToken(vendor?.address, tokens) ||
  (Array.isArray(vendor?.categories) &&
    vendor.categories.some((category: unknown) => matchesAnyToken(category, tokens)));

/**
 * Menus captured during onboarding live on the vendor document instead of the
 * FoodItem collection, so a dish word has to be looked for in both places.
 */
const onboardedMenuMatches = (vendor: any, tokens: string[]) => {
  const operations = vendor?.operations || {};
  const menuCategories = Array.isArray(operations.menuCategories) ? operations.menuCategories : [];
  const uploadedRows = Array.isArray(operations.menuUploadRows) ? operations.menuUploadRows : [];

  const categoryMatch = menuCategories.some(
    (category: any) =>
      matchesAnyToken(category?.name, tokens) ||
      (Array.isArray(category?.items) &&
        category.items.some(
          (item: any) => matchesAnyToken(item?.name, tokens) || matchesAnyToken(item?.description, tokens)
        ))
  );

  return (
    categoryMatch ||
    uploadedRows.some(
      (row: any) => matchesAnyToken(row?.itemName, tokens) || matchesAnyToken(row?.category, tokens)
    )
  );
};

/**
 * Keep the vendors whose name, cuisines, address or MENU matches the search term,
 * de-duplicated by vendor id so a restaurant matching several dishes appears once.
 */
const filterVendorsBySearch = async (vendors: any[], term: string) => {
  const tokens = toSearchTokens(term);
  if (tokens.length === 0) return vendors;

  const patterns = tokens.map((token) => new RegExp(escapeRegex(token), "i"));
  const menuMatches = await FoodItem.find({
    vendorId: { $in: vendors.map((vendor) => vendor._id) },
    isAvailable: true,
    $or: [{ name: { $in: patterns } }, { category: { $in: patterns } }, { description: { $in: patterns } }],
  })
    .select("vendorId")
    .lean();

  const vendorIdsWithMatchingDish = new Set(menuMatches.map((item: any) => String(item.vendorId)));

  return vendors.filter(
    (vendor) =>
      vendorTextMatches(vendor, tokens) ||
      vendorIdsWithMatchingDish.has(String(vendor._id)) ||
      onboardedMenuMatches(vendor, tokens)
  );
};

// Upper bound on documents scanned when a filter has to run in memory: open-now
// and search are derived server-side, so Mongo cannot page them.
const MAX_IN_MEMORY_SCAN = 300;

// Same response whether or not the email is registered, and the OTP work only
// happens for a real account, so response timing does not leak it either. A
// 404 here would let anyone enumerate which emails have a vendor account.
const FORGOT_PASSWORD_RESPONSE = { message: "If an account exists for this email, an OTP has been sent." };

export const forgotVendorPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const vendor = await Vendor.findOne({ email });
    if (vendor) {
      // Generate OTP and save
      const otp = generateOTP();
      await OTP.create({
        phone: vendor.phone,
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      // Send email
      await sendEmail({
        to: email,
        subject: "Password Reset OTP — Precision Nav",
        html: getOTPEmailHtml(otp),
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
      });
    }

    res.json(FORGOT_PASSWORD_RESPONSE);
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetVendorPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      code: otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update password
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({ message: "Account not found" });
    }

    vendor.password = newPassword;
    await vendor.save();

    res.json({ message: "Password reset successfully. You can now sign in with your new password." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNearbyVendors = async (req: Request, res: Response) => {
  try {
    const { lat, lng, page = 1, limit = 20, radius, minRating, sort, openNow, search } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    // Admin Panel bypass: lat=0 & lng=0 fetches all vendors
    if (userLat === 0 && userLng === 0) {
      console.log(`[API] Fetching ALL vendors for Admin Panel`);
      const allVendors = await Vendor.find({ partnerType: { $ne: "meat" } }).sort({ createdAt: -1 }).lean();
      return res.json(allVendors.map((vendor) => ({ ...vendor, openState: evaluateOutletOpenState(vendor) })));
    }

    // Zone Serviceability Check
    const zonesService = new ZonesService();
    const activeZone = await zonesService.getZoneForCoordinates(userLat, userLng);
    if (!activeZone) {
      console.log(`[API] Location [lat: ${userLat}, lng: ${userLng}] is outside all active zones. Returning 0 vendors.`);
      return res.json([]);
    }

    const maxDefaultRadius = 15000; // 15 km max default radius
    const radiusInMeters = radius ? Math.max(1000, Number(radius) || 0) : maxDefaultRadius;
    const skip = (Number(page) - 1) * Number(limit);

    console.log(`[API] Fetching nearby vendors - Lat: ${userLat}, Lng: ${userLng}, Page: ${page} (Zone: ${activeZone.name})`);

    const sortMode = sort === "rating" || sort === "distance" ? sort : "default";
    const minRatingValue = Number(minRating);
    const hasMinRating = Number.isFinite(minRatingValue) && minRatingValue > 0;
    const openNowOnly = String(openNow) === "true";
    const searchTerm = typeof search === "string" ? search.trim() : "";

    // Build spatial match query enforcing active zone boundaries
    const geoQuery: any = { partnerType: { $ne: "meat" } };
    // Applied inside $geoNear so pagination counts only matching vendors — a
    // client-side pass would filter one page and let $skip re-introduce the rest.
    if (hasMinRating) {
      geoQuery.rating = { $gte: minRatingValue };
    }
    if (activeZone.type === "polygon" && activeZone.boundary) {
      geoQuery.location = {
        $geoWithin: {
          $geometry: activeZone.boundary
        }
      };
    }

    const maxDist = activeZone.type === "circle" && activeZone.radius 
      ? Math.min(radiusInMeters, activeZone.radius) 
      : radiusInMeters;

    // Open-now and search are derived server-side, so Mongo cannot page them:
    // those requests scan a bounded candidate set and page in memory instead.
    const pagesInMemory = openNowOnly || searchTerm.length > 0;

    // MongoDB Proximity Query with Pagination
    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          distanceField: "distance",
          maxDistance: maxDist,
          spherical: true,
          key: "location",
          query: geoQuery,
        },
      },
      sortMode === "rating" ? { $sort: { rating: -1, distance: 1 } } : { $sort: { distance: 1 } },
    ];

    if (pagesInMemory) {
      pipeline.push({ $limit: MAX_IN_MEMORY_SCAN });
    } else {
      pipeline.push({ $skip: skip }, { $limit: Number(limit) });
    }

    const candidates = await Vendor.aggregate(pipeline);
    const vendors = searchTerm ? await filterVendorsBySearch(candidates, searchTerm) : candidates;

    // Apply Time Estimation (Option B)
    const evaluatedVendors = vendors.map((vendor) => {
      const distanceInKm = vendor.distance / 1000;

      // Assume 20km/h speed + 15 mins prep time
      const travelTimeMinutes = (distanceInKm / 20) * 60;
      const totalEstimatedTime = Math.round(travelTimeMinutes + 15);
      const openState = evaluateOutletOpenState(vendor);

      return {
        ...vendor,
        openState,
        isOpen: openState.isOpen,
        distanceKm: Math.round(distanceInKm * 10) / 10,
        distanceMeters: Math.round(vendor.distance),
        time: `${totalEstimatedTime}-${totalEstimatedTime + 10} min`,
        distance: distanceInKm < 1
          ? `${Math.round(vendor.distance)} metres`
          : `${distanceInKm.toFixed(1)} km`,
        // Every price in this app is rupees — this line used to read "USD 0
        // delivery fee over USD 12", which is what the customer saw on the card.
        offer: vendor.deliveryFee === 0
          ? "FREE delivery"
          : `₹${vendor.deliveryFee} delivery fee`,
      };
    });

    const openVendors = openNowOnly
      ? evaluatedVendors.filter((vendor) => vendor.openState.isOpen)
      : evaluatedVendors;
    const formattedVendors = pagesInMemory ? openVendors.slice(skip, skip + Number(limit)) : openVendors;

    res.json(formattedVendors);
    console.log(`[API] Found ${formattedVendors.length} vendors nearby`);
  } catch (error) {
    console.error("Error fetching nearby vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean();
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    // openState carries today's window and the full week so the details screen can
    // show real timings instead of a hardcoded "Open now".
    const openState = evaluateOutletOpenState(vendor);
    res.json({ ...vendor, openState, isOpen: openState.isOpen });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import generateToken from "../../utils/generateToken";

export const loginVendor = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").replace(/\D/g, "");
    const password = String(req.body.password || "");

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "Email/phone and password are required" });
    }

    const vendor = await Vendor.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (!vendor?.password) {
      return res.status(401).json({ message: "Invalid email/phone or password" });
    }

    if (await vendor.matchPassword(password)) {
      res.json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        role: vendor.partnerType === "meat" ? "meat_vendor" : "restaurant_vendor",
        partnerType: vendor.partnerType || "food",
        token: generateToken(
          vendor._id.toString(),
          vendor.partnerType === "meat" ? "meat_vendor" : "restaurant_vendor"
        ),
      });
    } else {
      res.status(401).json({ message: "Invalid email/phone or password" });
    }
  } catch (error) {
    console.error("Error logging in vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, googlePlaceId, location, address, image, categories, isPureVeg, deliveryFee, minOrderValue } = req.body;

    const queryConditions: any[] = [{ phone }];
    if (email && email.trim() !== "") {
      queryConditions.push({ email });
    }
    const existingVendor = await Vendor.findOne({ $or: queryConditions });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor with this email or phone already exists" });
    }

    const vendor = new Vendor({
      name,
      email,
      phone,
      password,
      googlePlaceId,
      location,
      address,
      image,
      categories,
      isPureVeg,
      deliveryFee,
      minOrderValue
    });

    await vendor.save();
    res.status(201).json({ message: "Vendor created successfully", vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fileName = (file?: { name?: string } | null) => file?.name || undefined;

const requireFields = (payload: any) => {
  const missing: string[] = [];
  const requireText = (value: unknown, label: string) => {
    if (typeof value !== "string" || value.trim().length === 0) missing.push(label);
  };

  const partnerType = payload.partnerType === "meat" ? "meat" : "food";
  requireText(payload.restaurantName, partnerType === "meat" ? "Meat center name" : "Restaurant name");
  if (!Array.isArray(payload.cuisines) || payload.cuisines.length === 0) {
    missing.push(partnerType === "meat" ? "Meat categories" : "Cuisine / Food Category");
  }
  requireText(payload.ownerName, "Owner full name");
  if (!payload.ownerEmail || !String(payload.ownerEmail).includes("@")) missing.push("Owner email address");
  if (String(payload.portalPassword || "").length < 6) missing.push("Vendor portal password");
  if (!/^\d{10}$/.test(String(payload.ownerPhone || ""))) missing.push("Owner phone number");
  if (payload.otp !== "1234" || !payload.otpVerified) missing.push("OTP verification");
  if (!payload.location?.lat || !payload.location?.lng) missing.push("GPS location");
  requireText(payload.address?.area, "Area / Sector / Locality");
  requireText(payload.address?.city, "City");
  requireText(payload.address?.landmark, "Nearby landmark");
  if (!Array.isArray(payload.selectedDays) || payload.selectedDays.length === 0) missing.push("Days of operation");
  const dayTimeSlots = payload.dayTimeSlots || {};
  if (Array.isArray(payload.selectedDays)) {
    payload.selectedDays.forEach((day: string) => {
      if (!Array.isArray(dayTimeSlots[day]) || !dayTimeSlots[day].some((slot: any) => slot.open && slot.close)) {
        missing.push(`${day} timings`);
      }
    });
  }
  if (partnerType === "food") {
    if (payload.menuSetupMode === "upload") {
      if (!fileName(payload.menuReferenceFile) || !payload.menuUploadValid) missing.push("Valid uploaded menu sheet");
      if (!Array.isArray(payload.menuUploadRows) || payload.menuUploadRows.length === 0) {
        missing.push("Uploaded sheet item rows");
      } else if (payload.menuUploadRows.some((row: any) => !fileName(row.image))) {
        missing.push("Image for every uploaded sheet item");
      }
    } else if (!Array.isArray(payload.menuCategories) || !payload.menuCategories.some((category: any) => Array.isArray(category.items) && category.items.length > 0)) {
      missing.push("Manual menu category and item");
    }
  }

  requireText(payload.panNumber, "PAN number");
  if (!fileName(payload.panFile)) missing.push("PAN file");
  if (!payload.gstExempt) {
    requireText(payload.gstin, "GSTIN");
    if (!fileName(payload.gstFile)) missing.push("GST file");
  }
  if (!/^\d{14}$/.test(String(payload.fssaiNumber || ""))) missing.push("FSSAI number");
  requireText(payload.fssaiExpiry, "FSSAI expiry");
  if (!fileName(payload.fssaiFile)) missing.push("FSSAI file");
  if (String(payload.bankAccount || "").length < 9) missing.push("Bank account number");
  if (payload.bankAccount !== payload.bankConfirm) missing.push("Matching bank account confirmation");
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(payload.ifsc || ""))) missing.push("IFSC code");
  if (!payload.ifscFetched) missing.push("IFSC verification");
  if (!fileName(payload.chequeFile)) missing.push("Cancelled cheque / bank statement");
  if (!payload.acceptedTos) missing.push("Accepted contract terms");
  requireText(payload.signature, "Digital signature");

  return missing;
};

export const saveVendorOnboarding = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const status = payload.status === "submitted" ? "submitted" : "draft";

    if (status === "submitted") {
      const missing = requireFields(payload);
      if (missing.length > 0) {
        return res.status(400).json({
          message: `Please complete required fields: ${missing.join(", ")}`,
          missing,
        });
      }
    }

    const ownerPhoneInput = String(payload.ownerPhone || payload.phone || "").replace(/\D/g, "");
    const ownerEmail = String(payload.ownerEmail || payload.email || "").trim().toLowerCase();
    const ownerPhone = ownerPhoneInput || (status === "draft" && ownerEmail ? `draft-${ownerEmail}` : "");
    const lat = Number(payload.location?.lat);
    const lng = Number(payload.location?.lng);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
    const addressParts = [
      payload.address?.shopNo,
      payload.address?.floor,
      payload.address?.area,
      payload.address?.city,
      payload.address?.landmark,
    ].filter(Boolean);
    const formattedAddress = payload.address?.formattedAddress || addressParts.join(", ");

    if (!ownerPhone) {
      return res.status(400).json({ message: "Owner phone number is required to save onboarding" });
    }

    const hashedPortalPassword = payload.portalPassword
      ? await bcrypt.hash(String(payload.portalPassword), 10)
      : undefined;

    const vendorData = {
      name: payload.restaurantName || "Draft restaurant",
      email: ownerEmail || undefined,
      phone: ownerPhone,
      ...(hashedPortalPassword ? { password: hashedPortalPassword } : {}),
      googlePlaceId: payload.googlePlaceId,
      onboardingStatus: status,
      partnerType: payload.partnerType === "meat" ? "meat" : "food",
      owner: {
        name: payload.ownerName,
        email: ownerEmail,
        phone: ownerPhoneInput || "",
        primaryContact: payload.primaryContact || ownerPhoneInput,
        otpVerified: payload.otpVerified && payload.otp === "1234",
      },
      location: {
        type: "Point",
        coordinates: hasLocation ? [lng, lat] : [0, 0],
      },
      address: formattedAddress || "Draft address",
      detailedAddress: {
        shopNo: payload.address?.shopNo,
        floor: payload.address?.floor,
        area: payload.address?.area,
        city: payload.address?.city,
        landmark: payload.address?.landmark,
        formattedAddress,
      },
      image: payload.image || "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500",
      categories: payload.cuisines || [],
      operations: {
        selectedDays: payload.selectedDays || [],
        timeSlots: payload.timeSlots || [],
        dayTimeSlots: payload.dayTimeSlots || {},
        menuSetupMode: payload.menuSetupMode || "manual",
        menuReferenceFileName: fileName(payload.menuReferenceFile),
        menuUploadValid: Boolean(payload.menuUploadValid),
        menuUploadRows: (payload.menuUploadRows || []).map((row: any) => ({
          category: row.category,
          itemName: row.itemName,
          price: row.price,
          description: row.description,
          type: row.type,
          isBestseller: row.isBestseller,
          imageFileName: fileName(row.image),
        })),
        menuCategories: (payload.menuCategories || []).map((category: any) => ({
          name: category.name,
          items: (category.items || []).map((item: any) => ({
            name: item.name,
            price: item.price,
            description: item.description,
            isVeg: item.isVeg,
            isBestseller: item.isBestseller,
            photoFileName: fileName(item.photo),
          })),
        })),
      },
      legal: {
        panNumber: payload.panNumber,
        panFileName: fileName(payload.panFile),
        gstin: payload.gstin,
        gstFileName: fileName(payload.gstFile),
        gstExempt: Boolean(payload.gstExempt),
        fssaiNumber: payload.fssaiNumber,
        fssaiExpiry: payload.fssaiExpiry,
        fssaiFileName: fileName(payload.fssaiFile),
        bankAccount: payload.bankAccount,
        accountType: payload.accountType || "savings",
        ifsc: payload.ifsc,
        ifscVerified: Boolean(payload.ifscFetched),
        chequeFileName: fileName(payload.chequeFile),
      },
      contract: {
        acceptedTos: Boolean(payload.acceptedTos),
        signature: payload.signature,
        signedAt: status === "submitted" ? new Date() : undefined,
      },
    };

    const matchQuery = ownerEmail
      ? { $or: [{ phone: ownerPhone }, { email: ownerEmail }] }
      : { phone: ownerPhone };

    // This route is deliberately public — the partner website posts to it before
    // the applicant has any account — so the upsert below must never be able to
    // take over a vendor that already exists. A vendor's phone and email are both
    // served by the unauthenticated GET /vendors/nearby, so without these two
    // guards, knowing either one was enough to $set over a live vendor's record
    // (name, address, bank account) and, by sending portalPassword, reset their
    // portal password and sign in as them.
    const existing = await Vendor.findOne(matchQuery)
      .select("onboardingStatus password")
      .lean();

    if (existing && existing.onboardingStatus && existing.onboardingStatus !== "draft") {
      return res.status(409).json({
        message:
          "An account already exists for this phone number or email. Please sign in to the partner portal, or contact support to update your details.",
      });
    }

    // Credentials are set once, on a record that does not have them yet. An
    // applicant resuming a draft keeps the password they already chose.
    if (existing?.password) {
      delete (vendorData as { password?: string }).password;
    }

    const vendor = await Vendor.findOneAndUpdate(
      matchQuery,
      { $set: vendorData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(status === "submitted" ? 201 : 200).json({
      message: status === "submitted" ? "Onboarding submitted successfully" : "Draft saved successfully",
      vendor,
    });
  } catch (error: any) {
    console.error("Error saving vendor onboarding:", error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Vendor with this email or phone already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

import axios from "axios";

export const searchGooglePlaces = async (req: Request, res: Response) => {
  try {
    const { query, mode, types } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // ── TEXT SEARCH MODE ────────────────────────────────────────────────────────
    // Best for category-matched results (e.g. "aa chicken mutton shop in City")
    // No type restriction — query keywords do the category filtering
    if (mode === "textsearch") {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`,
        { params: { query, key: apiKey } }
      );

      const results = (response.data.results || []).map((item: any) => ({
        place_id: item.place_id,
        description: item.formatted_address,
        structured_formatting: {
          main_text: item.name,
          secondary_text: item.formatted_address,
        },
      }));

      return res.json(results);
    }

    // ── AUTOCOMPLETE + MEAT FILTER MODE ────────────────────────────────────────
    // Runs Google Autocomplete with ONLY the raw typed prefix (e.g. "aa").
    // DO NOT append location text to the input — Autocomplete does literal prefix
    // matching, so "aa in Rajahmundry" will never match "Aadab Mutton & Chicken"
    // Center. Location scope is handled via the `components` country filter.
    // Results are then post-filtered by meat keywords to strip non-food places.
    if (mode === "autocomplete-meat") {
      const MEAT_KEYWORDS = [
        "chicken", "mutton", "meat", "gosht", "fish", "poultry",
        "butcher", "non-veg", "nalli", "nihari", "halal", "beef",
        "lamb", "kheema", "keema", "maas", "murgi", "bakra",
        "center", "centre", "shop", "store", "fresh",
      ];

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: query,   // raw typed prefix ONLY (e.g. "aa", "mub")
            key: apiKey,
            types: "establishment",
            language: "en",
            components: "country:in",  // scope to India; avoids appending city text
          },
        }
      );

      const results = (response.data.predictions || [])
        .filter((item: any) => {
          // Keep only places whose name or address mentions a meat-related keyword
          const text = (
            (item.structured_formatting?.main_text || "") + " " +
            (item.structured_formatting?.secondary_text || "") + " " +
            (item.description || "")
          ).toLowerCase();
          return MEAT_KEYWORDS.some((kw) => text.includes(kw));
        })
        .map((item: any) => ({
          place_id: item.place_id,
          description: item.description,
          structured_formatting: {
            main_text: item.structured_formatting?.main_text || item.description,
            secondary_text: item.structured_formatting?.secondary_text || "",
          },
        }));

      return res.json(results);
    }

    // ── AUTOCOMPLETE MODE (default) ─────────────────────────────────────────────
    // Used for vendor/restaurant searches (types=food scopes to food businesses)
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input: query,
          key: apiKey,
          types: (types && ["establishment", "geocode", "address", "regions", "cities"].includes(String(types))) ? types : "establishment",
          language: "en",
        },
      }
    );

    const results = (response.data.predictions || []).map((item: any) => ({
      place_id: item.place_id,
      description: item.description,
      structured_formatting: {
        main_text: item.structured_formatting?.main_text || item.description,
        secondary_text: item.structured_formatting?.secondary_text || "",
      },
    }));

    res.json(results);
  } catch (error) {
    console.error("Error searching Google Places:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeVendorPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const vendor = await Vendor.findById(req.user?.userId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const isMatch = await vendor.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    vendor.password = newPassword;
    await vendor.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlaceDetails = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: apiKey,
          fields: "place_id,name,formatted_address,geometry,rating,user_ratings_total,photos",
        },
      }
    );

    res.json(response.data.result);
  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, googlePlaceId, location, address, image, categories, isPureVeg, isOpen, openingHours, isManuallyClosed, deliveryFee, minOrderValue, onboardingStatus, commissionRate } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Check if email or phone is already taken by another vendor
    if (email && email !== vendor.email) {
      const emailExists = await Vendor.findOne({ email, _id: { $ne: id as any } } as any);
      if (emailExists) {
        return res.status(400).json({ message: "Vendor with this email already exists" });
      }
    }
    if (phone && phone !== vendor.phone) {
      const phoneExists = await Vendor.findOne({ phone, _id: { $ne: id as any } } as any);
      if (phoneExists) {
        return res.status(400).json({ message: "Vendor with this phone already exists" });
      }
    }

    if (name !== undefined) vendor.name = name;
    if (email !== undefined) vendor.email = email;
    if (phone !== undefined) vendor.phone = phone;
    if (password) vendor.password = password; // pre-save hook will hash it
    if (googlePlaceId !== undefined) vendor.googlePlaceId = googlePlaceId;
    if (location !== undefined) vendor.location = location;
    if (address !== undefined) vendor.address = address;
    if (image !== undefined) vendor.image = image;
    if (categories !== undefined) vendor.categories = categories;
    if (isPureVeg !== undefined) vendor.isPureVeg = isPureVeg;
    if (isOpen !== undefined) vendor.isOpen = isOpen;
    if (openingHours !== undefined) vendor.openingHours = openingHours;
    if (isManuallyClosed !== undefined) vendor.isManuallyClosed = isManuallyClosed;
    if (deliveryFee !== undefined) vendor.deliveryFee = deliveryFee;
    if (minOrderValue !== undefined) vendor.minOrderValue = minOrderValue;
    if (onboardingStatus !== undefined) vendor.onboardingStatus = onboardingStatus;
    if (commissionRate !== undefined) vendor.commissionRate = commissionRate;

    await vendor.save();
    const updatedVendor = vendor.toObject();
    res.json({
      message: "Vendor updated successfully",
      vendor: { ...updatedVendor, openState: evaluateOutletOpenState(updatedVendor) },
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const paymentService = new PaymentService();

/**
 * What a vendor can withdraw: their share (items subtotal minus the platform commission,
 * Vendor.commissionRate %) of delivered orders whose money was actually received — paid online
 * or cash collected by the driver — and not refunded, minus payouts already requested,
 * in progress or sent. Orders without a recorded payment are not counted.
 */
export async function getVendorPayoutBalance(vendorId: any, commissionRate?: number) {
  const rate = Math.min(100, Math.max(0, Number(commissionRate ?? 10)));
  const [earned] = await Order.aggregate<{ gross: number }>([
    {
      $match: {
        vendor: vendorId,
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.DELIVERED_LC, OrderStatus.COMPLETED] },
        paymentStatus: { $in: ["paid", "cash_collected"] },
        refundStatus: { $nin: ["pending", "processed"] },
      },
    },
    { $group: { _id: null, gross: { $sum: { $ifNull: ["$priceBreakdown.baseFare", 0] } } } },
  ]);
  const [paid] = await VendorPayout.aggregate<{ total: number }>([
    { $match: { vendor: vendorId, status: { $in: [VendorPayoutStatus.PENDING, VendorPayoutStatus.PROCESSING, VendorPayoutStatus.PROCESSED] } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const earnedShare = Math.floor((earned?.gross || 0) * (1 - rate / 100));
  return { earnedShare, paidOut: paid?.total || 0, availableBalance: Math.max(0, earnedShare - (paid?.total || 0)) };
}

export const requestVendorPayout = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    const vendor = await Vendor.findById(req.user?.userId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor account not found" });
    }

    if (!vendor.legal?.bankAccount || !vendor.legal?.ifsc) {
      return res.status(400).json({ message: "Verified bank account details are required before requesting payout" });
    }

    const payoutAmount = Number(amount);
    if (isNaN(payoutAmount) || payoutAmount < 100) {
      return res.status(400).json({ message: "Minimum payout amount is Rs.100" });
    }

    // One payout request at a time per vendor, so two requests can't both pass the balance check.
    const now = new Date();
    const locked = await Vendor.findOneAndUpdate(
      { _id: vendor._id, $or: [{ payoutLockUntil: null }, { payoutLockUntil: { $exists: false } }, { payoutLockUntil: { $lt: now } }] },
      { $set: { payoutLockUntil: new Date(now.getTime() + 60_000) } },
    );
    if (!locked) {
      return res.status(409).json({ message: "A payout request is already being processed. Please wait a moment." });
    }

    let payoutRecord;
    try {
      // Never pay out more than the vendor has actually earned and not yet been paid.
      const balance = await getVendorPayoutBalance(vendor._id, vendor.commissionRate);
      if (payoutAmount > balance.availableBalance) {
        return res.status(400).json({
          message: `Payout amount exceeds your available balance of Rs.${balance.availableBalance}`,
          availableBalance: balance.availableBalance,
        });
      }

      // "pending" = requested; it already counts against the balance.
      payoutRecord = await VendorPayout.create({
        vendor: vendor._id,
        amount: payoutAmount,
        status: VendorPayoutStatus.PENDING,
      });
    } finally {
      await Vendor.updateOne({ _id: vendor._id }, { $set: { payoutLockUntil: null } });
    }

    const recordId = payoutRecord._id.toString();
    try {
      // Send it through RazorpayX. null = payouts not configured: the request stays "pending".
      const result = await paymentService.createVendorPayout({
        referenceId: recordId,
        name: vendor.name || vendor.owner?.name || "Vendor Partner",
        phone: vendor.phone || vendor.owner?.phone || "0000000000",
        email: vendor.email || vendor.owner?.email,
        accountNumber: vendor.legal.bankAccount,
        ifsc: vendor.legal.ifsc,
        amount: payoutAmount,
        notes: {
          vendorId: vendor._id.toString(),
          payoutRecordId: recordId,
        },
      });

      if (result) {
        await VendorPayout.updateOne(
          { _id: recordId },
          { $set: { razorpayContactId: result.contact.id, razorpayFundAccountId: result.fundAccount.id } },
        );
        // Status comes only from RazorpayX's answer (processed only if RazorpayX says so).
        await applyRazorpayXPayout("vendor", recordId, result.payout);
      }
    } catch (apiError: any) {
      const outcomeUnknown = apiError instanceof RazorpayXError && apiError.stage === "payout" && !apiError.definitive;
      await VendorPayout.updateOne(
        { _id: recordId, status: VendorPayoutStatus.PENDING },
        {
          $set: outcomeUnknown
            ? { status: VendorPayoutStatus.PROCESSING, failureReason: "Awaiting confirmation from RazorpayX" }
            : { status: VendorPayoutStatus.FAILED, failureReason: apiError.message || "RazorpayX error" },
        },
      );
      if (!outcomeUnknown) {
        return res.status(500).json({
          message: "Failed to initiate payout transfer",
          error: apiError.message,
        });
      }
      console.error(`[vendors] ALERT payout ${recordId} outcome unknown:`, apiError.message);
    }

    const saved = await VendorPayout.findById(recordId);
    if (saved?.status === VendorPayoutStatus.FAILED) {
      return res.status(500).json({ message: "Payout failed", error: saved.failureReason });
    }
    return res.json({
      message:
        saved?.status === VendorPayoutStatus.PROCESSED ? "Payout processed"
        : saved?.status === VendorPayoutStatus.PROCESSING ? "Payout is being processed"
        : "Payout requested",
      payout: {
        id: recordId,
        razorpayPayoutId: saved?.razorpayPayoutId,
        amount: payoutAmount,
        status: saved?.status,
      },
    });
  } catch (error: any) {
    console.error("Vendor payout request error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

