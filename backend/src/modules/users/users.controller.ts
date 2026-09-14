import { Response } from "express";
import User from "../../database/models/User";
import Order from "../../database/models/Order";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import FoodItem from "../../database/models/FoodItem";
import MeatItem from "../../database/models/MeatItem";
import { AuthRequest } from "../../middleware/auth.middleware";
import cloudinary from "../../utils/cloudinary";

/** Trims, collapses runs of whitespace and lowercases, so "MG  Road " == "mg road". */
const normalizeAddressText = (value: unknown) =>
  String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/** Two saved pins within ~30 m of each other are the same doorstep in practice. */
const SAME_PIN_METRES = 30;

const metresBetween = (a: [number, number], b: [number, number]) => {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const [lngA, latA] = a;
  const [lngB, latB] = b;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

/**
 * Same address = same label plus either the same written address or the same
 * map pin. The label is part of it deliberately: "Home" and "Work" can legitimately
 * be the same building, and the customer chose to keep both.
 */
const isSameAddress = (existing: any, incoming: any) => {
  if (normalizeAddressText(existing?.label) !== normalizeAddressText(incoming?.label)) return false;

  const existingLine = normalizeAddressText(existing?.addressLine);
  const incomingLine = normalizeAddressText(incoming?.addressLine);
  if (existingLine && existingLine === incomingLine) return true;

  const existingPin = existing?.location?.coordinates;
  const incomingPin = incoming?.location?.coordinates;
  const isPin = (c: any): c is [number, number] =>
    Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]) && (c[0] !== 0 || c[1] !== 0);
  if (!isPin(existingPin) || !isPin(incomingPin)) return false;

  return metresBetween(existingPin, incomingPin) <= SAME_PIN_METRES;
};

export class UsersController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, username, email, phone, bio } = req.body;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (name) user.name = name;
      if (username) user.username = username;
      if (email) user.email = email;
      if (phone) user.phone = phone;

      await user.save();
      return res.json(user);
    } catch (error: any) {
      console.error("Update profile error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "Username or Email already exists" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async uploadProfilePic(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Upload to Cloudinary using stream
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      }) as any;

      user.profilePic = result.secure_url;
      await user.save();

      return res.json({ profilePic: user.profilePic, user });
    } catch (error: any) {
      console.error("Upload profile pic error:", error);
      return res.status(500).json({ message: error.message || "Failed to upload image" });
    }
  }

  async deleteProfilePic(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // The Cloudinary asset is left in place deliberately: the same URL can
      // still be referenced by an already-delivered order or a cached screen.
      user.profilePic = undefined as any;
      await user.save();

      return res.json({ profilePic: null, user });
    } catch (error: any) {
      console.error("Delete profile pic error:", error);
      return res.status(500).json({ message: error.message || "Failed to remove image" });
    }
  }

  async addAddress(req: AuthRequest, res: Response) {
    try {
      const { label, addressLine, phone, receiverName, receiverPhone, landmark, coordinates } = req.body;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const lng = coordinates?.lng ?? 0;
      const lat = coordinates?.lat ?? 0;
      const trimmedReceiverPhone = String(receiverPhone || "").trim();

      const newAddress = {
        label,
        addressLine,
        phone: phone || trimmedReceiverPhone || user.phone,
        receiverName,
        receiverPhone: trimmedReceiverPhone || undefined,
        landmark,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };

      // Saving the same place twice produced a second entry every time — the app
      // has several ways in (search result, map pin, "use current location", the
      // location sheet), and none of them checked. An existing match is replaced
      // in place and re-appended, so the list stays free of duplicates and the
      // caller can still read the address it just saved off the end.
      const duplicate = user.addresses.findIndex((existing: any) =>
        isSameAddress(existing, newAddress)
      );
      if (duplicate !== -1) user.addresses.splice(duplicate, 1);

      user.addresses.push(newAddress as any);
      await user.save();
      return res.status(201).json(user.addresses);
    } catch (error: any) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { label, addressLine, phone, receiverName, receiverPhone, landmark, coordinates } = req.body;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const address = user.addresses.find((a: any) => a._id?.toString() === id);
      if (!address) return res.status(404).json({ message: "Address not found" });

      if (label) address.label = label;
      if (addressLine) address.addressLine = addressLine;
      if (phone) address.phone = phone;
      // Explicit undefined checks rather than the truthy style above, so an
      // empty string can clear a receiver detail that was set before.
      if (receiverName !== undefined) address.receiverName = receiverName;
      if (receiverPhone !== undefined) address.receiverPhone = receiverPhone;
      if (landmark !== undefined) address.landmark = landmark;
      if (coordinates) {
        address.location = {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        };
      }

      await user.save();
      return res.json(user.addresses);
    } catch (error) {
      console.error("Update address error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.addresses = user.addresses.filter((a: any) => a._id?.toString() !== id) as any;
      await user.save();
      return res.json(user.addresses);
    } catch (error) {
      console.error("Delete address error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.password) {
        return res.status(400).json({ message: "No password set on this account. Please sign up with a password first." });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Change password error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAddresses(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user.addresses || []);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getRecentLocations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const locationsMap = new Map<string, any>();

      for (const order of orders) {
        if (Array.isArray(order.stops)) {
          for (const stop of order.stops) {
            if (
              stop.address &&
              Array.isArray(stop.location?.coordinates) &&
              stop.location.coordinates.length === 2
            ) {
              const lng = stop.location.coordinates[0];
              const lat = stop.location.coordinates[1];
              const fullAddr = stop.address.trim();

              if (!fullAddr || (lat === 0 && lng === 0)) continue;

              const normalized = fullAddr.toLowerCase();
              if (!locationsMap.has(normalized)) {
                const parts = fullAddr.split(",");
                const name = parts[0]?.trim() || fullAddr;
                const addressDetail = parts.length > 1 ? parts.slice(1).join(",").trim() : fullAddr;

                locationsMap.set(normalized, {
                  id: String((stop as any)._id || order._id || locationsMap.size + 1),
                  name: name,
                  address: addressDetail,
                  fullAddress: fullAddr,
                  lat,
                  lng,
                  createdAt: order.createdAt,
                });
              }
            }
          }
        }
      }

      const recentLocations = Array.from(locationsMap.values()).slice(0, 10);
      return res.json(recentLocations);
    } catch (error) {
      console.error("Get recent locations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async saveBookingPreference(req: AuthRequest, res: Response) {
    try {
      const { type, contactNumber } = req.body as {
        type?: "myself" | "someone_else";
        contactNumber?: string;
      };

      if (!type || !["myself", "someone_else"].includes(type)) {
        return res.status(400).json({ message: "Valid booking type is required." });
      }

      if (type === "someone_else") {
        const normalized = String(contactNumber || "").replace(/\D/g, "");
        if (normalized.length < 10) {
          return res.status(400).json({ message: "A valid contact number is required for someone else bookings." });
        }
      }

      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.bookingPreference = {
        type,
        contactNumber: type === "someone_else" ? String(contactNumber || "").replace(/\D/g, "") : undefined,
        updatedAt: new Date(),
      };
      await user.save();

      return res.json({ bookingPreference: user.bookingPreference });
    } catch (error) {
      console.error("Save booking preference error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getFavorites(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const favoriteIds = user.favorites || [];
      const [vendors, meatCenters] = await Promise.all([
        Vendor.find({ _id: { $in: favoriteIds } }).lean(),
        MeatCenter.find({ _id: { $in: favoriteIds } }).lean(),
      ]);

      const combined = [
        ...vendors,
        ...meatCenters.map((mc: any) => ({ ...mc, partnerType: "meat", role: "meat_vendor" }))
      ];

      const ordered = favoriteIds
        .map(id => combined.find(item => item._id.toString() === id.toString()))
        .filter(Boolean);

      return res.json(ordered);
    } catch (error) {
      console.error("Get favorites error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response) {
    try {
      const { vendorId } = req.params;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.favorites) {
        user.favorites = [];
      }

      const index = user.favorites.indexOf(vendorId as any);
      let isFavorite = false;
      if (index === -1) {
        user.favorites.push(vendorId as any);
        isFavorite = true;
      } else {
        user.favorites.splice(index, 1);
      }

      await user.save();
      return res.json({ isFavorite, favorites: user.favorites });
    } catch (error) {
      console.error("Toggle favorite error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Dish-level favorites mirror getFavorites/toggleFavorite above: item IDs
  // can belong to either FoodItem or MeatItem, so we resolve against both
  // collections at read time rather than tracking which type each ID is.
  async getFavoriteItems(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const favoriteItemIds = user.favoriteItems || [];
      const [foodItems, meatItems] = await Promise.all([
        FoodItem.find({ _id: { $in: favoriteItemIds } }).lean(),
        MeatItem.find({ _id: { $in: favoriteItemIds } }).lean(),
      ]);

      const combined = [
        ...foodItems.map((item: any) => ({
          _id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.images?.[0],
          category: item.category,
          isVeg: item.isVeg,
          vendorId: item.vendorId,
          isMeat: false,
        })),
        ...meatItems.map((item: any) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          vendorId: item.meatCenterId,
          isMeat: true,
        })),
      ];

      const ordered = favoriteItemIds
        .map((id) => combined.find((item) => item._id.toString() === id.toString()))
        .filter(Boolean);

      return res.json(ordered);
    } catch (error) {
      console.error("Get favorite items error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async toggleFavoriteItem(req: AuthRequest, res: Response) {
    try {
      const { itemId } = req.params;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.favoriteItems) {
        user.favoriteItems = [];
      }

      const index = user.favoriteItems.indexOf(itemId as any);
      let isFavorite = false;
      if (index === -1) {
        user.favoriteItems.push(itemId as any);
        isFavorite = true;
      } else {
        user.favoriteItems.splice(index, 1);
      }

      await user.save();
      return res.json({ isFavorite, favoriteItems: user.favoriteItems });
    } catch (error) {
      console.error("Toggle favorite item error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updatePushToken(req: AuthRequest, res: Response) {
    try {
      const { expoPushToken } = req.body;
      if (!expoPushToken) {
        return res.status(400).json({ message: "expoPushToken is required" });
      }

      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Unset this push token if it's already registered on any other user (Priority 2)
      await User.updateMany(
        { expoPushToken, _id: { $ne: req.user?.userId } },
        { $unset: { expoPushToken: "" } }
      );

      user.expoPushToken = expoPushToken;
      await user.save();

      return res.json({ message: "Push token updated successfully", expoPushToken: user.expoPushToken });
    } catch (error) {
      console.error("Update push token error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}


