import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDevDrivers } from "@/features/drivers/hooks/useDevDrivers";
import { DevDriversHeader } from "@/features/drivers/components/DevDriversHeader";
import { DevDriversGrid } from "@/features/drivers/components/DevDriversGrid";

export default function DevDrivers() {
  const {
    drivers,
    isLoading,
    updatingId,
    isSeeding,
    isDeleting,
    seedDrivers,
    deleteDrivers,
    handleStatusToggle,
    handleVehicleChange,
    handleLocationSubmit,
  } = useDevDrivers();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DevDriversHeader isSeeding={isSeeding} isDeleting={isDeleting} onSeed={seedDrivers} onDelete={deleteDrivers} />

        <DevDriversGrid
          isLoading={isLoading}
          drivers={drivers}
          updatingId={updatingId}
          onStatusToggle={handleStatusToggle}
          onVehicleChange={handleVehicleChange}
          onLocationSubmit={handleLocationSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
