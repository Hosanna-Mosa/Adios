import { LayoutTemplate, MonitorPlay, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/shared/LazyImage";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { Banner } from "../bannerTypes";

interface BannerCardProps {
  banner: Banner;
  onToggleStatus: (banner: Banner) => void;
  isToggling: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}

const ITEM_TYPE_LABEL_KEY: Record<string, string> = {
  banner: "catalog.bannerHero",
  ad: "catalog.advertisement",
};

const POSITION_LABEL_KEY: Record<string, string> = {
  hero: "catalog.heroSectionTop",
  startup: "catalog.appStartupModal",
  below_greetings: "catalog.belowGreetings",
  driver_dashboard: "catalog.driverDashboard",
};

/** One banner card in the grid. */
export function BannerCard({ banner, onToggleStatus, isToggling, onEdit, onDelete }: BannerCardProps) {
  const { t } = useTranslation();
  return (
    <StaggerItem className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 w-full relative">
        <LazyImage src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
        {!banner.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t("catalog.inactive")}</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight">{banner.title}</h3>
          <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
            {banner.itemType === "ad" ? <MonitorPlay className="w-3 h-3" /> : <LayoutTemplate className="w-3 h-3" />}
            <span className="capitalize">{t(ITEM_TYPE_LABEL_KEY[banner.itemType] || ITEM_TYPE_LABEL_KEY.banner)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-500 text-xs capitalize font-medium text-purple-600">{t(POSITION_LABEL_KEY[banner.position] || POSITION_LABEL_KEY.hero)}</p>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-xs text-gray-500 font-medium">
            <span>{t("catalog.orderColon", { value: banner.displayOrder || 0, defaultValue: "Order: {{value}}" })}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1 flex-1">{banner.description}</p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <Button
            variant={banner.isActive ? "outline" : "default"}
            size="sm"
            className={banner.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
            onClick={() => onToggleStatus(banner)}
            disabled={isToggling}
          >
            {banner.isActive ? t("catalog.deactivate") : t("catalog.activate")}
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(banner)}>
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(banner._id)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}
