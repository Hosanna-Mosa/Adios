import { StaggerList } from "@/components/motion/StaggerList";
import { BannerCard } from "./BannerCard";
import type { Banner } from "../bannerTypes";

interface BannerGridProps {
  banners: Banner[] | undefined;
  isLoading: boolean;
  onToggleStatus: (banner: Banner) => void;
  isToggling: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}

/** The banner cards grid, with loading/empty states. */
export function BannerGrid({ banners, isLoading, onToggleStatus, isToggling, onEdit, onDelete }: BannerGridProps) {
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <p>Loading banners...</p>
      ) : banners?.length === 0 ? (
        <p className="text-gray-500 col-span-full">No banners found. Create one to get started.</p>
      ) : (
        banners?.map((banner) => <BannerCard key={banner._id} banner={banner} onToggleStatus={onToggleStatus} isToggling={isToggling} onEdit={onEdit} onDelete={onDelete} />)
      )}
    </StaggerList>
  );
}
