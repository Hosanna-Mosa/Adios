import { Users as UsersIcon, UserCheck, UserX, Shield, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ListPageShell } from "@/components/shared/ListPageShell";
import { FilterBar } from "@/components/shared/FilterBar";
import { FormDialog } from "@/components/shared/FormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/features/users/components/UserTable";
import { useUsersList } from "@/features/users/hooks/useUsersList";

export default function Users() {
  const { t } = useTranslation();
  const {
    users,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    roleFilterOptions,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedUsers,
    filteredUsers,
    activeUsersCount,
    driverCount,
    adminCount,
    isAddOpen,
    setIsAddOpen,
    newUser,
    setNewUser,
    handleCreateSubmit,
    isCreating,
    isViewOpen,
    setIsViewOpen,
    viewingUser,
    handleDeleteClick,
    handleBanClick,
  } = useUsersList();

  return (
    <DashboardLayout searchPlaceholder={t("users.searchByNameEmailOrId")}>
      <ListPageShell
        stats={[
          { icon: <UsersIcon className="h-5 w-5" />, label: t("users.totalUsers"), value: users.length.toString() },
          { icon: <UserCheck className="h-5 w-5" />, label: t("users.customers"), value: activeUsersCount.toString(), badge: t("users.active"), badgeColor: "success" },
          { icon: <UserX className="h-5 w-5" />, label: t("sidebar.drivers"), value: driverCount.toString(), badge: t("users.verified"), badgeColor: "muted" },
          { icon: <Shield className="h-5 w-5" />, label: t("users.admins"), value: adminCount.toString(), badge: t("dashboard.system"), badgeColor: "success" },
        ]}
        title={t("users.userManagement")}
        description={t("users.viewAndManageDesc")}
        filterBar={
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={t("users.searchUsersEllipsis")}
            filters={[{ value: roleFilter, onChange: setRoleFilter, options: roleFilterOptions }]}
            actions={
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" /> {t("users.addUser")}
              </button>
            }
          />
        }
        table={<UserTable data={paginatedUsers} isLoading={isLoading} onBan={handleBanClick} onDelete={handleDeleteClick} />}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          itemLabel: t("sidebar.users"),
          shownCount: paginatedUsers.length,
          totalCount: filteredUsers.length,
        }}
      >
        <FormDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          title={t("users.addNewUser")}
          onSubmit={handleCreateSubmit}
          submitLabel={t("users.confirmAndSaveUser")}
          submitPendingLabel={t("users.creatingEllipsis")}
          isSubmitting={isCreating}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("users.fullName")}</label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder={t("users.egJohnDoe")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("vendorAuth.emailAddress")}</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("users.phoneNumber")}</label>
            <Input
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder={t("users.egPhoneNumber")}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("vendorAuth.password")}</label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder={t("users.setInitialPassword")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("users.systemRole")}</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="USER">{t("users.customerUserRole")}</option>
              <option value="DRIVER">{t("users.driverRole")}</option>
              <option value="ADMIN">{t("users.systemAdministratorRole")}</option>
            </select>
          </div>
        </FormDialog>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{t("users.userInformation")}</DialogTitle>
            </DialogHeader>
            {viewingUser && (
              <div className="space-y-4 py-4 text-sm">
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("users.fullNameColon")}</span>
                  <span className="font-medium text-foreground">{viewingUser.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("users.systemRoleColon")}</span>
                  <span className="font-medium text-foreground uppercase">{viewingUser.role}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("users.phoneColon")}</span>
                  <span className="font-medium text-foreground">{viewingUser.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("vendorAuth.emailAddress")}:</span>
                  <span className="font-medium text-foreground">{viewingUser.email || t("vendorDashboard.notAvailable")}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("users.addressesCountColon")}</span>
                  <span className="font-medium text-foreground">{viewingUser.addresses?.length || 0}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">{t("users.accountCreatedColon")}</span>
                  <span className="font-medium text-foreground">{new Date(viewingUser.createdAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </ListPageShell>
    </DashboardLayout>
  );
}
