import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminZone, ZoneEditForm } from "../types";

interface ZoneEditDialogProps {
  zone: AdminZone | null;
  form: ZoneEditForm;
  onChange: (form: ZoneEditForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

/**
 * Full edit of an existing zone: name, description, surge multiplier, radius
 * (circle zones only) and active state — replacing the old rename-only
 * prompt(). A polygon's drawn boundary is not editable here.
 */
export function ZoneEditDialog({ zone, form, onChange, onClose, onSubmit, isSaving }: ZoneEditDialogProps) {
  const { t } = useTranslation();
  if (!zone) return null;

  const inputClass = "w-full h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground">{t("zones.editZone")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{t("zones.typeZone", { type: zone.type, defaultValue: "{{type}} zone" })}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="zone-edit-name" className="text-xs font-semibold text-muted-foreground">
              {t("zones.zoneName")}
            </label>
            <input id="zone-edit-name" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className={inputClass} required />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="zone-edit-desc" className="text-xs font-semibold text-muted-foreground">
              {t("zones.description")}
            </label>
            <textarea
              id="zone-edit-desc"
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="zone-edit-mult" className="text-xs font-semibold text-muted-foreground">
                {t("zones.surgeMultiplier")}
              </label>
              <input
                id="zone-edit-mult"
                type="number"
                step="0.1"
                min="1"
                value={form.pricingMultiplier}
                onChange={(e) => onChange({ ...form, pricingMultiplier: e.target.value })}
                className={inputClass}
              />
            </div>

            {zone.type === "circle" && (
              <div className="space-y-1.5">
                <label htmlFor="zone-edit-radius" className="text-xs font-semibold text-muted-foreground">
                  {t("zones.radiusMetres")}
                </label>
                <input
                  id="zone-edit-radius"
                  type="number"
                  min="100"
                  step="100"
                  value={form.radius}
                  onChange={(e) => onChange({ ...form, radius: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <label htmlFor="zone-edit-active" className="flex items-center gap-2.5 cursor-pointer">
            <input
              id="zone-edit-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm text-foreground">{t("zones.zoneIsActive")}</span>
          </label>

          {zone.type === "polygon" && <p className="text-[11px] text-muted-foreground">{t("zones.boundaryNotEditableDesc")}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              {t("zones.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSaving ? t("common.savingEllipsis") : t("zones.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
