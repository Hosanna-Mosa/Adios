import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pagination } from "@/components/shared/Pagination";
import { DownloadReportDialog } from "@/components/shared/DownloadReportDialog";
import { useDriversList } from "@/features/drivers/hooks/useDriversList";
import { useZoneAssignment } from "@/features/drivers/hooks/useZoneAssignment";
import { useDriverChat } from "@/features/drivers/hooks/useDriverChat";
import { DriverStatsRow } from "@/features/drivers/components/DriverStatsRow";
import { DriverMetricsRow } from "@/features/drivers/components/DriverMetricsRow";
import { DriverFilters } from "@/features/drivers/components/DriverFilters";
import { DriverTable } from "@/features/drivers/components/DriverTable";
import { DriverOnboardDialog } from "@/features/drivers/components/DriverOnboardDialog";
import { DriverDocsDialog } from "@/features/drivers/components/DriverDocsDialog";
import { DriverZoneTab } from "@/features/drivers/components/DriverZoneTab";
import { DriverZoneAssignDialog } from "@/features/drivers/components/DriverZoneAssignDialog";
import { DriverOrderChatDialog } from "@/features/drivers/components/DriverOrderChatDialog";

export default function Drivers() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"fleet" | "zones">("fleet");

  const {
    drivers,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilterOptions,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedDrivers,
    filteredDrivers,
    searchedDrivers,
    orders,
    onlineDrivers,
    totalOrdersCount,
    completedCount,
    cancelledCount,
    totalEarningsToday,
    ordersToday,
    isAddOpen,
    setIsAddOpen,
    newDriver,
    setNewDriver,
    handleOnboardSubmit,
    isCreating,
    isViewOpen,
    setIsViewOpen,
    viewingDriver,
    setViewingDriver,
    isDownloadOpen,
    setIsDownloadOpen,
    handleViewClick,
    handleToggleStatus,
    handleToggleBlock,
    handleDeleteClick,
    handleFocusOnMap,
    getAvatarUrl,
    getLocationDetails,
    getVehicleString,
    updateDriverMutation,
  } = useDriversList();

  const {
    zonesList,
    isAssignZoneOpen,
    setIsAssignZoneOpen,
    selectedDriverForZone,
    setSelectedDriverForZone,
    selectedZoneForDriver,
    setSelectedZoneForDriver,
    isEditingAssignment,
    openAssignDialog,
    openEditDialog,
    handleAssignZone,
    handleConfirmAssign,
  } = useZoneAssignment();

  const {
    isChatModalOpen,
    setIsChatModalOpen,
    chatDriver,
    selectedOrderForChat,
    setSelectedOrderForChat,
    chatMessages,
    loadingChatMessages,
    handleOpenChatModal,
  } = useDriverChat();

  return (
    <DashboardLayout searchPlaceholder={t("drivers.searchDriversVehicleIdsRegions")}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <DriverStatsRow totalRegistered={drivers.length} onlineDrivers={onlineDrivers} totalEarningsToday={totalEarningsToday} />

        {/* Tab Selection */}
        <div className="flex border-b border-border mb-4 gap-2">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "fleet" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("drivers.fleetDirectoryAndMap")}
          </button>
          <button
            onClick={() => setActiveTab("zones")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "zones" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("drivers.zoneAssignments")}
          </button>
        </div>

        {activeTab === "fleet" && (
          <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("drivers.fleetOverview")}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t("drivers.realTimeMonitoringDesc")}</p>
              </div>
              <DriverFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilterOptions={statusFilterOptions}
                onStatusFilterChange={setStatusFilter}
                onAddClick={() => setIsAddOpen(true)}
              />
            </div>

            <div className="overflow-x-auto">
              <DriverTable
                drivers={paginatedDrivers}
                isLoading={isLoading}
                getAvatarUrl={getAvatarUrl}
                getLocationDetails={getLocationDetails}
                getVehicleString={getVehicleString}
                onViewClick={handleViewClick}
                onFocusOnMap={handleFocusOnMap}
                onOpenChatModal={handleOpenChatModal}
                onToggleStatus={handleToggleStatus}
                onToggleBlock={handleToggleBlock}
                onDeleteClick={handleDeleteClick}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemLabel={t("sidebar.drivers")}
              shownCount={paginatedDrivers.length}
              totalCount={filteredDrivers.length}
            />
          </div>
        )}

        <DriverMetricsRow
          totalOrdersCount={totalOrdersCount}
          completedCount={completedCount}
          cancelledCount={cancelledCount}
          ordersTodayCount={ordersToday.length}
          totalEarningsToday={totalEarningsToday}
        />
      </div>

      <DriverOnboardDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        newDriver={newDriver}
        onChange={setNewDriver}
        onSubmit={handleOnboardSubmit}
        isSubmitting={isCreating}
      />

      <DriverDocsDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        driver={viewingDriver}
        onToggleAadhaarVerified={() => {
          if (!viewingDriver) return;
          updateDriverMutation.mutate({ id: viewingDriver._id, data: { aadhaarVerified: !viewingDriver.aadhaarVerified } });
          setViewingDriver({ ...viewingDriver, aadhaarVerified: !viewingDriver.aadhaarVerified });
        }}
        onToggleBankVerified={() => {
          if (!viewingDriver) return;
          updateDriverMutation.mutate({ id: viewingDriver._id, data: { bankVerified: !viewingDriver.bankVerified } });
          setViewingDriver({ ...viewingDriver, bankVerified: !viewingDriver.bankVerified });
        }}
        onApprove={() => {
          if (!viewingDriver) return;
          updateDriverMutation.mutate({
            id: viewingDriver._id,
            data: { onboardingStatus: "completed", aadhaarVerified: true, bankVerified: true },
          });
          setViewingDriver({ ...viewingDriver, onboardingStatus: "completed", aadhaarVerified: true, bankVerified: true });
        }}
        onReject={() => {
          if (!viewingDriver) return;
          updateDriverMutation.mutate({ id: viewingDriver._id, data: { onboardingStatus: "rejected" } });
          setViewingDriver({ ...viewingDriver, onboardingStatus: "rejected" });
        }}
      />

      <DownloadReportDialog
        open={isDownloadOpen}
        onOpenChange={setIsDownloadOpen}
        title={t("drivers.fleetDriversReport")}
        data={drivers.map((d) => ({
          [t("drivers.driverName")]: d.user?.name || t("vendorDashboard.notAvailable"),
          [t("vendorAuth.emailAddress")]: d.user?.email || t("vendorDashboard.notAvailable"),
          [t("drivers.phone")]: d.user?.phone || t("vendorDashboard.notAvailable"),
          [t("drivers.vehicleType")]: d.vehicleType || t("vendorDashboard.notAvailable"),
          [t("drivers.vehicleNumber")]: d.vehicleNumber || t("vendorDashboard.notAvailable"),
          [t("drivers.dutyStatus")]: d.status || t("vendorDashboard.notAvailable"),
          [t("drivers.onboardingStatus")]: d.onboardingStatus || t("vendorDashboard.notAvailable"),
        }))}
      />

      <DriverZoneAssignDialog
        open={isAssignZoneOpen}
        onOpenChange={setIsAssignZoneOpen}
        isEditing={isEditingAssignment}
        drivers={drivers}
        zonesList={zonesList}
        selectedDriverId={selectedDriverForZone}
        onSelectDriver={setSelectedDriverForZone}
        selectedZoneId={selectedZoneForDriver}
        onSelectZone={setSelectedZoneForDriver}
        onConfirm={handleConfirmAssign}
      />

      <DriverOrderChatDialog
        open={isChatModalOpen}
        onOpenChange={setIsChatModalOpen}
        chatDriver={chatDriver}
        orders={orders}
        selectedOrderId={selectedOrderForChat?._id}
        onSelectOrder={setSelectedOrderForChat}
        chatMessages={chatMessages}
        loadingChatMessages={loadingChatMessages}
        hasSelectedOrder={!!selectedOrderForChat}
      />

      {activeTab === "zones" && (
        <DriverZoneTab
          drivers={searchedDrivers}
          zonesList={zonesList}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          getAvatarUrl={getAvatarUrl}
          getVehicleString={getVehicleString}
          onAssignClick={openAssignDialog}
          onEditClick={openEditDialog}
          onRemoveZone={(driverId, driverName) => {
            if (confirm(t("drivers.confirmRemoveZoneAssignment", { name: driverName, defaultValue: "Remove zone assignment for driver {{name}}?" }))) {
              handleAssignZone(driverId, null);
            }
          }}
          onOpenChatModal={handleOpenChatModal}
        />
      )}
    </DashboardLayout>
  );
}
