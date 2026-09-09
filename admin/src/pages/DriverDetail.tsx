import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useDriverDetail } from "@/features/drivers/hooks/useDriverDetail";
import { DriverDetailHeader } from "@/features/drivers/components/DriverDetailHeader";
import { DriverIdentityCard } from "@/features/drivers/components/DriverIdentityCard";
import { DriverDetailStats } from "@/features/drivers/components/DriverDetailStats";
import { DriverDocsApprovalPanel } from "@/features/drivers/components/DriverDocsApprovalPanel";
import { DriverTripsTable } from "@/features/drivers/components/DriverTripsTable";
import { DriverDetailZoneDialog } from "@/features/drivers/components/DriverDetailZoneDialog";
import { DriverTripChatDialog } from "@/features/drivers/components/DriverTripChatDialog";

export default function DriverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    zones,
    isZoneOpen,
    setIsZoneOpen,
    zone1Id,
    setZone1Id,
    zone2Id,
    setZone2Id,
    selectedOrderChat,
    setSelectedOrderChat,
    chatMessages,
    isChatLoading,
    isUpdating,
    handleDeleteClick,
    handleToggleBlock,
    handleToggleAadhaarVerified,
    handleToggleBankVerified,
    handleApprove,
    handleReject,
    handleConfirmZoneAssignment,
    navigateToDrivers,
  } = useDriverDetail(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12 space-y-4">
          <h2 className="text-xl font-bold text-destructive">Error Loading Driver Details</h2>
          <p className="text-muted-foreground">The requested driver profile could not be found or there was an issue retrieving the data.</p>
          <Button onClick={() => navigate("/drivers")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Drivers Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { driver, stats, orders } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <DriverDetailHeader isBlocked={!!driver.user?.isBlocked} isUpdating={isUpdating} onBack={navigateToDrivers} onToggleBlock={() => handleToggleBlock(!!driver.user?.isBlocked)} onDeleteClick={handleDeleteClick} />

        <DriverIdentityCard driver={driver} onAssignZoneClick={() => setIsZoneOpen(true)} />

        <DriverDetailStats totalOrders={stats.totalOrders} completedOrders={stats.completedOrders} cancelledOrders={stats.cancelledOrders} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DriverDocsApprovalPanel
              driver={driver}
              onToggleAadhaarVerified={() => handleToggleAadhaarVerified(driver.aadhaarVerified)}
              onToggleBankVerified={() => handleToggleBankVerified(driver.bankVerified)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>

          <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">Executed Trips & Deliveries</h3>
            <DriverTripsTable orders={orders} onViewChat={setSelectedOrderChat} />
          </div>
        </div>
      </div>

      <DriverDetailZoneDialog
        isOpen={isZoneOpen}
        onOpenChange={setIsZoneOpen}
        driverName={driver.user?.name}
        zones={zones}
        zone1Id={zone1Id}
        onZone1Change={setZone1Id}
        zone2Id={zone2Id}
        onZone2Change={setZone2Id}
        onConfirm={handleConfirmZoneAssignment}
        isSaving={isUpdating}
      />

      <DriverTripChatDialog orderId={selectedOrderChat} onOpenChange={(open) => !open && setSelectedOrderChat(null)} messages={chatMessages} isLoading={isChatLoading} />
    </DashboardLayout>
  );
}
