import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OrderChatDialog } from "@/components/shared/OrderChatDialog";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserDetailHeader } from "@/features/users/components/UserDetailHeader";
import { UserIdentityCard } from "@/features/users/components/UserIdentityCard";
import { UserDetailStats } from "@/features/users/components/UserDetailStats";
import { UserEditForm } from "@/features/users/components/UserEditForm";
import { UserOrderHistory } from "@/features/users/components/UserOrderHistory";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    form,
    setForm,
    handleProfileSubmit,
    isSavingProfile,
    toggleBlock,
    isTogglingBlock,
    handleDeleteClick,
    selectedOrderChat,
    setSelectedOrderChat,
    chatMessages,
    isChatLoading,
    navigateToUsers,
  } = useUserDetail(id);

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
          <h2 className="text-xl font-bold text-destructive">Error Loading User Details</h2>
          <p className="text-muted-foreground">The requested user could not be found or there was an issue retrieving the profile.</p>
          <Button onClick={() => navigate("/users")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Users Directory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { user, stats, orders } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <UserDetailHeader isBlocked={user.isBlocked} isTogglingBlock={isTogglingBlock} onBack={navigateToUsers} onToggleBlock={toggleBlock} onDeleteClick={handleDeleteClick} />

        <UserIdentityCard user={user} />

        <UserDetailStats totalOrders={stats.totalOrders} deliveryOrders={stats.deliveryOrders} ridesOrders={stats.ridesOrders} helperOrders={stats.helperOrders} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UserEditForm form={form} onChange={setForm} onSubmit={handleProfileSubmit} isSaving={isSavingProfile} />
          <UserOrderHistory orders={orders} onViewChat={setSelectedOrderChat} />
        </div>
      </div>

      <OrderChatDialog orderId={selectedOrderChat} onOpenChange={(open) => !open && setSelectedOrderChat(null)} messages={chatMessages} isLoading={isChatLoading} />
    </DashboardLayout>
  );
}
