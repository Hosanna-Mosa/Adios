import { Icon } from "../../../components/shared/Icon";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function MenuPreviewTable({ form }: Props) {
  const { menuUploadRows, updateMenuUploadRowImage } = form;
  if (menuUploadRows.length === 0) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-on-surface">Item images</p>
          <p className="text-xs text-secondary-app">
            {menuUploadRows.filter((row) => row.image).length}/{menuUploadRows.length} images added
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-secondary-app">
          Required
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-white text-xs font-semibold uppercase tracking-wide text-secondary-app">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Image</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {menuUploadRows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-secondary-app">{row.category || "-"}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">{row.itemName || "-"}</td>
                <td className="px-4 py-3 text-secondary-app">{row.price || "-"}</td>
                <td className="px-4 py-3 text-secondary-app">{row.type || "-"}</td>
                <td className="px-4 py-3">
                  {row.image ? (
                    <div className="flex items-center gap-2">
                      <Icon name="image" className="text-lg text-green-600" />
                      <span className="max-w-[150px] truncate text-xs font-semibold text-green-700">
                        {row.image.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateMenuUploadRowImage(row.id, null)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                        aria-label={`Remove image for ${row.itemName || "item"}`}
                      >
                        <Icon name="close" className="text-sm" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-secondary-app transition-all hover:border-brand-kinetic/40 hover:text-brand-kinetic">
                      <Icon name="add_photo_alternate" className="text-base" />
                      Upload image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => updateMenuUploadRowImage(row.id, e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!menuUploadRows.every((row) => row.image) && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          Upload an image for every item before moving to the next step.
        </div>
      )}
    </div>
  );
}
