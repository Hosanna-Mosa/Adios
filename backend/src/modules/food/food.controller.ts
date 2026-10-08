import { Request, Response } from "express";
import FoodItem from "../../database/models/FoodItem";
import Vendor from "../../database/models/Vendor";
import { evaluateOutletOpenState } from "../../utils/openingHours";
import { CloudinaryService } from "../../services/cloudinary.service";
import { ZonesService } from "../zones/zones.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";
import { bulkFoodRowSchema } from "./food.validation";
import { getDishOrderCounts, withComputedDishFields } from "./food.service";

const cloudinaryService = new CloudinaryService();

// A restaurant's menu lives in one of two places: FoodItem documents (vendor
// portal / seeds) or, for outlets that came through partner onboarding, inside
// vendor.operations. Everything customer-facing has to read both — the meat
// module already does this via buildOnboardedMeatItems().
const isTruthyFlag = (value: unknown) =>
  value === true || /^(yes|y|true|1)$/i.test(String(value ?? "").trim());

const parsePrice = (value: unknown) => {
  if (typeof value === "number") return value;
  const parsed = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildOnboardedFoodItems = (vendor: any) => {
  const operations = vendor?.operations || {};
  const menuCategories = Array.isArray(operations.menuCategories) ? operations.menuCategories : [];
  const uploadedRows = Array.isArray(operations.menuUploadRows) ? operations.menuUploadRows : [];
  const fallbackImages = vendor?.image ? [vendor.image] : [];

  const manualItems = menuCategories.flatMap((category: any, categoryIndex: number) =>
    (Array.isArray(category.items) ? category.items : []).map((item: any, index: number) => ({
      _id: `${vendor._id}-${category._id || category.name || categoryIndex}-${item._id || index}`,
      vendorId: vendor._id,
      name: item.name,
      description: item.description || "",
      price: parsePrice(item.price),
      images: fallbackImages,
      category: category.name || "General",
      isAvailable: true,
      isVeg: !!item.isVeg,
      orderCount: 0,
      isBestseller: isTruthyFlag(item.isBestseller),
      discountPercent: null,
    }))
  );

  const uploadedItems = uploadedRows.map((row: any, index: number) => ({
    _id: `${vendor._id}-upload-${index}`,
    vendorId: vendor._id,
    name: row.itemName,
    description: row.description || "",
    price: parsePrice(row.price),
    images: fallbackImages,
    category: row.category || "General",
    isAvailable: true,
    isVeg: String(row.type || "").toLowerCase() === "veg",
    orderCount: 0,
    isBestseller: isTruthyFlag(row.isBestseller),
    discountPercent: null,
  }));

  return [...manualItems, ...uploadedItems].filter((item) => item.name && item.price > 0);
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSearchTokens = (term: string) => term.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);

const matchesAnyToken = (value: unknown, tokens: string[]) => {
  if (typeof value !== "string" || !value) return false;
  const haystack = value.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
};

const itemMatchesTokens = (item: any, tokens: string[]) =>
  matchesAnyToken(item?.name, tokens) ||
  matchesAnyToken(item?.category, tokens) ||
  matchesAnyToken(item?.description, tokens);

const vendorMatchesTokens = (vendor: any, tokens: string[]) =>
  matchesAnyToken(vendor?.name, tokens) ||
  (Array.isArray(vendor?.categories) &&
    vendor.categories.some((category: unknown) => matchesAnyToken(category, tokens)));

/** Name hits beat category hits beat description hits; extra token hits break ties. */
const scoreItem = (item: any, term: string, tokens: string[]) => {
  const name = String(item?.name || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();
  const description = String(item?.description || "").toLowerCase();
  const lowerTerm = term.toLowerCase();

  let score = 0;
  if (name.startsWith(lowerTerm)) score += 100;
  else if (name.includes(lowerTerm)) score += 50;
  if (category.includes(lowerTerm)) score += 20;
  if (description.includes(lowerTerm)) score += 5;

  for (const token of tokens) {
    if (name.includes(token)) score += 3;
    if (category.includes(token)) score += 2;
    if (description.includes(token)) score += 1;
  }

  return score;
};

// Bounds on a single search: the onboarded-menu scan is a regex-free in-memory
// pass over vendor documents, so the vendor set must stay small.
const MAX_SEARCH_VENDORS = 120;
const MAX_SEARCH_ITEMS = 400;
const DEFAULT_SEARCH_LIMIT = 50;

export const getVendorMenu = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    // Unfiltered on purpose: the app renders isAvailable === false as "Sold out".
    const [storedMenu, vendor, counts] = await Promise.all([
      FoodItem.find({ vendorId }).lean(),
      Vendor.findById(vendorId).lean(),
      getDishOrderCounts(String(vendorId)),
    ]);
    const menu = storedMenu.map((item) => withComputedDishFields(item, counts));
    res.json(vendor ? [...menu, ...buildOnboardedFoodItems(vendor)] : menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const EDITABLE_FOOD_FIELDS = [
  "name",
  "description",
  "price",
  "images",
  "category",
  "isAvailable",
  "isVeg",
  "offerPrice",
  "protein",
  "calories",
  "bestsellerMinOrders",
] as const;

/** An offer price, when set, has to undercut the regular price. */
const offerPriceError = (price: unknown, offerPrice: unknown): string | null => {
  if (offerPrice === null || offerPrice === undefined) return null;
  const offer = Number(offerPrice);
  const regular = Number(price);
  if (!Number.isFinite(offer) || offer <= 0) return "offerPrice must be greater than 0";
  if (!Number.isFinite(regular) || offer >= regular) return "offerPrice must be less than price";
  return null;
};

export const addFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const {
      vendorId, name, description, price, images, category, isVeg,
      offerPrice, protein, calories, bestsellerMinOrders,
    } = req.body;

    if (req.user?.role !== UserRole.ADMIN && vendorId !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const offerError = offerPriceError(price, offerPrice);
    if (offerError) {
      return res.status(400).json({ message: offerError });
    }

    const foodItem = new FoodItem({
      vendorId,
      name,
      description,
      price,
      images,
      category,
      isVeg,
      offerPrice: offerPrice ?? null,
      protein: protein ?? null,
      calories: calories ?? null,
      bestsellerMinOrders: bestsellerMinOrders ?? null,
    });

    await foodItem.save();
    res.status(201).json(foodItem);
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /food/bulk — spreadsheet menu import. Rows are validated one by one: the
 * valid ones are inserted, the rest come back as { row (1-based), error }.
 */
export const bulkAddFoodItems = async (req: AuthRequest, res: Response) => {
  try {
    const { vendorId, items } = req.body as { vendorId: string; items: unknown[] };

    if (req.user?.role !== UserRole.ADMIN && vendorId !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const docs: Record<string, unknown>[] = [];
    const failed: { row: number; error: string }[] = [];

    items.forEach((raw, index) => {
      const parsed = bulkFoodRowSchema.safeParse(raw ?? {});
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        failed.push({ row: index + 1, error: issue?.message || "Invalid row" });
        return;
      }
      const row = parsed.data;
      docs.push({
        vendorId,
        name: row.name,
        category: row.category,
        price: row.price,
        description: row.description || "",
        offerPrice: row.offerPrice ?? null,
        isVeg: row.isVeg,
        protein: row.protein ?? null,
        calories: row.calories ?? null,
        images: [],
      });
    });

    let created = 0;
    if (docs.length > 0) {
      const inserted = await FoodItem.insertMany(docs);
      created = inserted.length;
    }

    res.json({ created, failed });
  } catch (error: any) {
    if (error?.name === "CastError" || error?.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid vendorId or menu rows" });
    }
    console.error("Error bulk adding food items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingItem = await FoodItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (req.user?.role !== UserRole.ADMIN && existingItem.vendorId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Allow-list: vendorId / timestamps / _id are never client-editable.
    const update: Record<string, unknown> = {};
    for (const field of EDITABLE_FOOD_FIELDS) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    // Validate against the stored price when only one of the two is being sent.
    const effectivePrice = update.price !== undefined ? update.price : existingItem.price;
    const effectiveOffer = update.offerPrice !== undefined ? update.offerPrice : existingItem.offerPrice;
    const offerError = offerPriceError(effectivePrice, effectiveOffer);
    if (offerError) {
      return res.status(400).json({ message: offerError });
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(id, { $set: update }, { new: true });
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFoodItemAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = await FoodItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (req.user?.role !== UserRole.ADMIN && item.vendorId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    item.isAvailable = isAvailable;
    await item.save();
    res.json(item);
  } catch (error) {
    console.error("Error updating food item availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingItem = await FoodItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (req.user?.role !== UserRole.ADMIN && existingItem.vendorId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await FoodItem.findByIdAndDelete(id);
    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const fileBuffers = files.map(file => file.buffer);
    const imageUrls = await cloudinaryService.uploadMultipleImages(fileBuffers);
    
    res.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const searchFoodItems = async (req: Request, res: Response) => {
  try {
    const { query, lat, lng, limit } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const term = String(query).trim();
    const tokens = toSearchTokens(term);
    if (tokens.length === 0) {
      return res.json([]);
    }
    // The raw term used to go straight into $regex, so "chicken (spicy)" was a 500.
    const patterns = tokens.map((token) => new RegExp(escapeRegex(token), "i"));

    // With coordinates the search is scoped to the outlets the caller can actually
    // order from, and every vendor comes back stamped with a distance to rank by.
    const userLat = parseFloat(String(lat));
    const userLng = parseFloat(String(lng));
    const hasCoords = Number.isFinite(userLat) && Number.isFinite(userLng);
    let nearbyVendors: any[] = [];

    if (hasCoords) {
      const zonesService = new ZonesService();
      const activeZone = await zonesService.getZoneForCoordinates(userLat, userLng);
      if (!activeZone) {
        return res.json([]);
      }

      const geoQuery: any = { partnerType: { $ne: "meat" } };
      if (activeZone.type === "polygon" && activeZone.boundary) {
        geoQuery.location = { $geoWithin: { $geometry: activeZone.boundary } };
      }
      const maxDist = activeZone.type === "circle" && activeZone.radius ? Math.min(15000, activeZone.radius) : 15000;

      nearbyVendors = await Vendor.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [userLng, userLat] },
            distanceField: "distance",
            maxDistance: maxDist,
            spherical: true,
            key: "location",
            query: geoQuery,
          },
        },
        { $limit: MAX_SEARCH_VENDORS },
        // This public, unauthenticated endpoint attaches the full vendor document
        // to every dish hit as `vendorId` (see collect() below) — without this,
        // that included the vendor's bcrypt password hash and login email.
        { $unset: "password" },
      ]);

      if (nearbyVendors.length === 0) {
        return res.json([]);
      }
    }

    const vendorMap = new Map<string, any>(nearbyVendors.map((vendor) => [String(vendor._id), vendor]));

    const storedItems = await FoodItem.find({
      // Sold-out dishes are kept: the app shows them as SOLD OUT rather than hiding them.
      ...(hasCoords ? { vendorId: { $in: nearbyVendors.map((vendor) => vendor._id) } } : {}),
      $or: [{ name: { $in: patterns } }, { category: { $in: patterns } }, { description: { $in: patterns } }],
    })
      .limit(MAX_SEARCH_ITEMS)
      .lean();

    // Menus captured during onboarding never become FoodItem documents, so the
    // vendor documents themselves have to be searched as well.
    let menuVendors = nearbyVendors;
    if (!hasCoords) {
      menuVendors = await Vendor.find({
        partnerType: { $ne: "meat" },
        $or: [
          { name: { $in: patterns } },
          { categories: { $in: patterns } },
          { "operations.menuCategories.name": { $in: patterns } },
          { "operations.menuCategories.items.name": { $in: patterns } },
          { "operations.menuUploadRows.itemName": { $in: patterns } },
          { "operations.menuUploadRows.category": { $in: patterns } },
        ],
      })
        .select("-password")
        .limit(MAX_SEARCH_VENDORS)
        .lean();

      for (const vendor of menuVendors) {
        vendorMap.set(String(vendor._id), vendor);
      }

      // Attach the outlet to every dish hit so the app can promote the restaurant.
      const missingVendorIds = storedItems
        .map((item: any) => String(item.vendorId))
        .filter((id: string) => !vendorMap.has(id));
      if (missingVendorIds.length > 0) {
        const owners = await Vendor.find({ _id: { $in: missingVendorIds } }).select("-password").lean();
        for (const vendor of owners) {
          vendorMap.set(String(vendor._id), vendor);
        }
      }
    }

    // The seed puts the same dish names on every outlet, so de-duplicate on
    // vendor + dish name rather than returning hundreds of near-identical rows.
    const seen = new Set<string>();
    const scored: { item: any; score: number; distance: number; rating: number }[] = [];
    const matchedVendorIds = new Set<string>();

    const collect = (item: any, vendor: any) => {
      const name = String(item?.name || "").trim();
      if (!name || !vendor) return;
      const key = `${String(vendor._id)}:${name.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      matchedVendorIds.add(String(vendor._id));
      // The app greys out ADD for an outlet that isn't taking orders right now.
      vendor.openState ??= evaluateOutletOpenState(vendor);
      scored.push({
        item: { ...item, vendorId: vendor },
        score: scoreItem(item, term, tokens),
        distance: typeof vendor.distance === "number" ? vendor.distance : Number.POSITIVE_INFINITY,
        rating: vendor.rating || 0,
      });
    };

    for (const item of storedItems) {
      collect(item, vendorMap.get(String(item.vendorId)));
    }

    const vendorsNeedingMenu: any[] = [];

    for (const vendor of menuVendors) {
      const onboardedItems = buildOnboardedFoodItems(vendor);
      for (const item of onboardedItems) {
        if (itemMatchesTokens(item, tokens)) collect(item, vendor);
      }

      // A restaurant whose own name or cuisine matches still has to surface, so
      // carry a couple of its dishes — the app promotes a restaurant into the
      // results from the outlet attached to a dish.
      if (!matchedVendorIds.has(String(vendor._id)) && vendorMatchesTokens(vendor, tokens)) {
        if (onboardedItems.length > 0) {
          for (const item of onboardedItems.slice(0, 2)) collect(item, vendor);
        } else {
          vendorsNeedingMenu.push(vendor);
        }
      }
    }

    // One batched read rather than a query per restaurant.
    if (vendorsNeedingMenu.length > 0) {
      const filler = await FoodItem.find({ vendorId: { $in: vendorsNeedingMenu.map((vendor) => vendor._id) } })
        .limit(MAX_SEARCH_ITEMS)
        .lean();
      const byVendor = new Map<string, any[]>();
      for (const item of filler) {
        const key = String(item.vendorId);
        const bucket = byVendor.get(key) || [];
        if (bucket.length < 2) bucket.push(item);
        byVendor.set(key, bucket);
      }
      for (const vendor of vendorsNeedingMenu) {
        for (const item of byVendor.get(String(vendor._id)) || []) collect(item, vendor);
      }
    }

    const maxResults = Math.max(1, Math.min(100, Number(limit) || DEFAULT_SEARCH_LIMIT));
    scored.sort((a, b) => b.score - a.score || a.distance - b.distance || b.rating - a.rating);

    res.json(scored.slice(0, maxResults).map((entry) => entry.item));
  } catch (error) {
    console.error("Error searching food items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** The ₹149 store lists dishes whose menu price is at most this. */
const STORE_149_MAX_PRICE = 149;

export const getStore149Items = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;
    
    // We will search for nearby vendors within active zone if lat/lng are provided
    let vendors: any[] = [];
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);

      if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
        const zonesService = new ZonesService();
        const activeZone = await zonesService.getZoneForCoordinates(userLat, userLng);
        if (!activeZone) {
          return res.json([]);
        }

        const geoQuery: any = { partnerType: { $ne: "meat" } };
        if (activeZone.type === "polygon" && activeZone.boundary) {
          geoQuery.location = { $geoWithin: { $geometry: activeZone.boundary } };
        }

        const maxDist = activeZone.type === "circle" && activeZone.radius ? Math.min(15000, activeZone.radius) : 15000;

        vendors = await Vendor.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [userLng, userLat] },
              distanceField: "distance",
              maxDistance: maxDist,
              spherical: true,
              key: "location",
              query: geoQuery,
            },
          },
          { $limit: 10 }
        ]);
        // A closed restaurant's dishes can't be ordered, so they don't belong in the store.
        vendors = vendors.filter((vendor) => evaluateOutletOpenState(vendor).isOpen);
      }
    }

    if (vendors.length === 0) {
      return res.json([]);
    }

    const vendorIds = vendors.map(v => v._id);
    // Was .limit(15): with $in across 10 vendors the whole page could come from the
    // farthest one, so nothing about the result was actually "nearby".
    // Only dishes whose real menu price is within ₹149: the cart and checkout re-price every
    // line from FoodItem.price (cart.catalog.ts), so the price shown here must be that price.
    const foodItems = await FoodItem.find({
      vendorId: { $in: vendorIds },
      isAvailable: true,
      price: { $gt: 0, $lte: STORE_149_MAX_PRICE },
    }).limit(150).lean();

    if (foodItems.length === 0) {
      return res.json([]);
    }

    // Map real database food items to be part of the 149 store
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));

    // Cap each outlet's share so the 10 shown dishes come from several nearby
    // restaurants instead of emptying the closest one's menu.
    const perVendorCount = new Map<string, number>();
    const MAX_ITEMS_PER_VENDOR = 3;

    const resultItems = foodItems
      .filter((item) => {
        const vendorKey = item.vendorId.toString();
        const used = perVendorCount.get(vendorKey) || 0;
        if (used >= MAX_ITEMS_PER_VENDOR) return false;
        perVendorCount.set(vendorKey, used + 1);
        return true;
      })
      .map((item) => {
        const vendor = vendorMap.get(item.vendorId.toString());

        // The outlet's real rating and review count — 0 when it has none yet.
        const itemRating = Number(vendor?.rating) || 0;
        const itemReviews = parseInt(String(vendor?.reviews ?? "").replace(/\D/g, ""), 10) || 0;

        // $geoNear stamped the vendor with a metre distance — carry it through so the
        // screen can show where each dish is coming from.
        const distanceMeters = typeof vendor?.distance === "number" ? Math.round(vendor.distance) : null;
        const distanceInKm = distanceMeters === null ? null : distanceMeters / 1000;

        return {
          _id: item._id,
          vendorId: item.vendorId,
          name: item.name,
          description: item.description || "",
          price: item.price,
          // FoodItem has no MRP / "was" price, so there is no strikethrough price to show.
          originalPrice: null,
          images: item.images || [],
          isVeg: item.isVeg,
          category: item.category,
          rating: itemRating,
          reviewsCount: itemReviews,
          brand: vendor?.name?.split(" - ")[0] || "Restaurant",
          distanceMeters,
          distanceKm: distanceInKm === null ? null : Math.round(distanceInKm * 10) / 10,
          distance: distanceInKm === null
            ? null
            : distanceInKm < 1
              ? `${distanceMeters} metres`
              : `${distanceInKm.toFixed(1)} km`,
        };
      });

    resultItems.sort(
      (a, b) => (a.distanceMeters ?? Number.POSITIVE_INFINITY) - (b.distanceMeters ?? Number.POSITIVE_INFINITY)
    );

    res.json(resultItems.slice(0, 10));
  } catch (error) {
    console.error("Error fetching 149 store items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

