import { Request, Response } from "express";
import FoodItem from "../../database/models/FoodItem";
import Vendor from "../../database/models/Vendor";
import { CloudinaryService } from "../../services/cloudinary.service";
import { ZonesService } from "../zones/zones.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { UserRole } from "../../database/models/User";

const cloudinaryService = new CloudinaryService();

export const getVendorMenu = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const menu = await FoodItem.find({ vendorId });
    res.json(menu);
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
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const dishes = await FoodItem.find({
      $or: [
        { name: { $regex: query as string, $options: "i" } },
        { description: { $regex: query as string, $options: "i" } },
        { category: { $regex: query as string, $options: "i" } }
      ]
    }).populate("vendorId");
    
    res.json(dishes);
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
    const foodItems = await FoodItem.find({ vendorId: { $in: vendorIds }, isAvailable: true }).limit(15);

    if (foodItems.length === 0) {
      return res.json([]);
    }

    // Map real database food items to be part of the 149 store
    const vendorMap = new Map(vendors.map(v => [v._id.toString(), v]));

    const resultItems = foodItems.map((item, idx) => {
      const vendor = vendorMap.get(item.vendorId.toString());
      const originalPrice = item.price > 149 ? item.price : 199;

      // Use realistic rating and review count from vendor or defaults
      const itemRating = vendor?.rating || parseFloat((4.0 + (idx % 10) * 0.1).toFixed(1));
      const itemReviews = vendor?.reviews ? parseInt(vendor.reviews.replace(/\D/g, '')) || 45 : 45;

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
        brand: vendor?.name?.split(" - ")[0] || "Restaurant"
      };
    });

    res.json(resultItems.slice(0, 10));
  } catch (error) {
    console.error("Error fetching 149 store items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

