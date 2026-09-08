import { useState } from "react";
import { Icon } from "../../../components/shared/Icon";
import type { PartnerType, MenuItem } from "../types";

export function ItemForm({
  initialItem,
  onSave,
  onCancel,
  partnerType = "food",
}: {
  initialItem?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
  partnerType?: PartnerType;
}) {
  const isMeatItem = partnerType === "meat";
  const [name, setName] = useState(initialItem?.name || "");
  const [price, setPrice] = useState(initialItem?.price || "");
  const [description, setDescription] = useState(initialItem?.description || "");
  const [isVeg, setIsVeg] = useState(initialItem?.isVeg ?? !isMeatItem);
  const [isBestseller, setIsBestseller] = useState(initialItem?.isBestseller || false);
  const [photo, setPhoto] = useState<File | null>(initialItem?.photo || null);

  const handleSave = () => {
    if (!name.trim() || !price) return;
    onSave({
      id: initialItem?.id || crypto.randomUUID(),
      name: name.trim(),
      price,
      description: description.trim(),
      isVeg,
      isBestseller,
      photo,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">
            {isMeatItem ? "Product Name" : "Item Name"} <span className="text-brand-kinetic">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isMeatItem ? "e.g. Chicken Curry Cut 500g" : "e.g. Butter Chicken"}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Price (₹) <span className="text-brand-kinetic">*</span></label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 349"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={isMeatItem ? "e.g. Fresh cut pieces, cleaned and packed" : "e.g. Creamy tomato-based curry with tender chicken pieces"}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        {!isMeatItem && (
          <div>
            <label className="block text-sm font-semibold mb-1.5">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  isVeg
                    ? "bg-green-50 text-green-700 border-green-300"
                    : "bg-white text-secondary-app border-gray-200"
                }`}
              >
                <span className="w-3 h-3 rounded-sm border-2 border-green-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </span>
                Veg
              </button>
              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  !isVeg
                    ? "bg-red-50 text-red-700 border-red-300"
                    : "bg-white text-secondary-app border-gray-200"
                }`}
              >
                <span className="w-3 h-3 rounded-sm border-2 border-red-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </span>
                Non-Veg
              </button>
            </div>
          </div>
        )}

        {/* Bestseller Toggle */}
        <div>
          <label className="block text-sm font-semibold mb-1.5">Tags</label>
          <button
            type="button"
            onClick={() => setIsBestseller(!isBestseller)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
              isBestseller
                ? "bg-orange-50 text-orange-700 border-orange-300"
                : "bg-white text-secondary-app border-gray-200"
            }`}
          >
            <Icon name="local_fire_department" className="text-base" />
            {isMeatItem ? "Featured" : "Bestseller"}
          </button>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          {isMeatItem ? "Product Photo" : "Item Photo"} <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="flex items-center gap-3">
          {photo ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Icon name="image" className="text-lg text-brand-kinetic" />
              <span className="text-xs font-medium truncate max-w-[120px]">{photo.name}</span>
              <button type="button" onClick={() => setPhoto(null)} className="text-gray-400 hover:text-red-500">
                <Icon name="close" className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-xs font-medium text-secondary-app cursor-pointer hover:border-brand-kinetic/30 hover:text-brand-kinetic transition-all">
                <Icon name="add_photo_alternate" className="text-lg" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </label>
              <button
                type="button"
                onClick={() => setPhoto(new File(["dummy photo data"], "item_photo_dummy.png", { type: "image/png" }))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-secondary-app hover:text-brand-kinetic hover:border-brand-kinetic/30 transition-all"
              >
                Use Dummy Photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-secondary-app hover:text-on-surface transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || !price}
          className="px-5 py-2.5 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialItem ? "Update Item" : isMeatItem ? "Add Product" : "Add to Menu"}
        </button>
      </div>
    </div>
  );
}