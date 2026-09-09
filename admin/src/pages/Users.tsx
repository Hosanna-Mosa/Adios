import { Users as UsersIcon, UserCheck, UserX, Shield, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ListPageShell } from "@/components/shared/ListPageShell";
import { FilterBar } from "@/components/shared/FilterBar";
import { FormDialog } from "@/components/shared/FormDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/features/users/components/UserTable";
import { useUsersList } from "@/features/users/hooks/useUsersList";

export default function Users() {
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
    <DashboardLayout searchPlaceholder="Search users by name, email, or ID...">
      <ListPageShell
        stats={[
          { icon: <UsersIcon className="h-5 w-5" />, label: "Total Users", value: users.length.toString(), badge: "+8% this month", badgeColor: "success" },
          { icon: <UserCheck className="h-5 w-5" />, label: "Customers", value: activeUsersCount.toString(), badge: "Active", badgeColor: "success" },
          { icon: <UserX className="h-5 w-5" />, label: "Drivers", value: driverCount.toString(), badge: "Verified", badgeColor: "muted" },
          { icon: <Shield className="h-5 w-5" />, label: "Admins", value: adminCount.toString(), badge: "System", badgeColor: "success" },
        ]}
        title="User Management"
        description="View and manage all registered platform users."
        filterBar={
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search users..."
            filters={[{ value: roleFilter, onChange: setRoleFilter, options: roleFilterOptions }]}
            actions={
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" /> Add User
              </button>
            }
          />
        }
        table={<UserTable data={paginatedUsers} isLoading={isLoading} onBan={handleBanClick} onDelete={handleDeleteClick} />}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          itemLabel: "users",
          shownCount: paginatedUsers.length,
          totalCount: filteredUsers.length,
        }}
      >
        <FormDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          title="Add New User"
          onSubmit={handleCreateSubmit}
          submitLabel="Confirm & Save User"
          submitPendingLabel="Creating..."
          isSubmitting={isCreating}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Set initial password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">System Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="USER">Customer (USER)</option>
              <option value="DRIVER">Driver (DRIVER)</option>
              <option value="ADMIN">System Administrator (ADMIN)</option>
            </select>
          </div>
        </FormDialog>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">User Information</DialogTitle>
            </DialogHeader>
            {viewingUser && (
              <div className="space-y-4 py-4 text-sm">
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">Full Name:</span>
                  <span className="font-medium text-foreground">{viewingUser.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">System Role:</span>
                  <span className="font-medium text-foreground uppercase">{viewingUser.role}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{viewingUser.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{viewingUser.email || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">Addresses Count:</span>
                  <span className="font-medium text-foreground">{viewingUser.addresses?.length || 0}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-border">
                  <span className="font-semibold text-muted-foreground">Account Created:</span>
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
