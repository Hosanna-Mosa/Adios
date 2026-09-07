import { Request, Response } from "express";
import FoodItem from "../../database/models/FoodItem";
import Vendor from "../../database/models/Vendor";
import { CloudinaryService } from "../../services/cloudinary.service";
import { ZonesService } from "../zones/zones.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";

const cloudinaryService = new CloudinaryService();

// A restaurant's menu lives in one of two places: FoodItem documents (vendor
// portal / seeds) or, for outlets that came through partner onboarding, inside
// vendor.operations. Everything customer-facing has to read both — the meat
// module already does this via buildOnboardedMeatItems().
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
    const [menu, vendor] = await Promise.all([
      FoodItem.find({ vendorId }).lean(),
      Vendor.findById(vendorId).lean(),
    ]);
    res.json(vendor ? [...menu, ...buildOnboardedFoodItems(vendor)] : menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    const { vendorId, name, description, price, images, category, isVeg } = req.body;

    if (req.user?.role !== UserRole.ADMIN && vendorId !== req.user?.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const foodItem = new FoodItem({
      vendorId,
      name,
      description,
      price,
      images,
      category,
      isVeg
    });

    await foodItem.save();
    res.status(201).json(foodItem);
  } catch (error) {
    console.error("Error adding food item:", error);
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

    const updatedItem = await FoodItem.findByIdAndUpdate(id, req.body, { new: true });
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
        const owners = await Vendor.find({ _id: { $in: missingVendorIds } }).lean();
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

export const getStore149Items = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;
    
    // Function to get distinct Unsplash image based on name
    const getMatchingImage = (name: string): string => {
      const n = name.toLowerCase();
      
      // Verified Indian Food Unsplash IDs
      if (n.includes("onion") || n.includes("rava")) return "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400";
      if (n.includes("mysore")) return "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400";
      if (n.includes("paper") || n.includes("ghee")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400";
      if (n.includes("dosa") || n.includes("pesarattu") || n.includes("appam")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400";
      
      if (n.includes("idli")) return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400";
      if (n.includes("vada") || n.includes("wada") || n.includes("gari") || n.includes("garry")) return "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400";
      if (n.includes("uttapam") || n.includes("uthappam")) return "https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=400";
      if (n.includes("upma") || n.includes("pongal") || n.includes("poha")) return "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400";
      if (n.includes("rice") || n.includes("pulao") || n.includes("biryani")) return "https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=400";
      if (n.includes("naan") || n.includes("roti") || n.includes("paratha") || n.includes("thepla") || n.includes("sandwich")) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400";
      if (n.includes("momos") || n.includes("manchurian") || n.includes("noodles") || n.includes("roll")) return "https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=400";
      if (n.includes("sweet") || n.includes("chocolate") || n.includes("gulab") || n.includes("jamun") || n.includes("halwa")) return "https://images.unsplash.com/photo-1605197584547-c91ffaba2dc1?w=400";
      return "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=400"; // fallback paneer/curry
    };
    
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
      }
    }

    if (vendors.length === 0) {
      return res.json([]);
    }

    const vendorIds = vendors.map(v => v._id);
    // Was .limit(15): with $in across 10 vendors the whole page could come from the
    // farthest one, so nothing about the result was actually "nearby".
    const foodItems = await FoodItem.find({ vendorId: { $in: vendorIds }, isAvailable: true }).limit(150).lean();

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
      .map((item, idx) => {
        const vendor = vendorMap.get(item.vendorId.toString());
        const originalPrice = item.price > 149 ? item.price : 199;

        // Use realistic rating and review count from vendor or defaults
        const itemRating = vendor?.rating || parseFloat((4.0 + (idx % 10) * 0.1).toFixed(1));
        const itemReviews = vendor?.reviews ? parseInt(vendor.reviews.replace(/\D/g, '')) || 45 : 45;

        // $geoNear stamped the vendor with a metre distance — carry it through so the
        // screen can show where each dish is coming from.
        const distanceMeters = typeof vendor?.distance === "number" ? Math.round(vendor.distance) : null;
        const distanceInKm = distanceMeters === null ? null : distanceMeters / 1000;

        return {
          _id: item._id,
          vendorId: item.vendorId,
          name: item.name,
          description: item.description || "",
          price: 149,
          originalPrice,
          images: [getMatchingImage(item.name)],
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

