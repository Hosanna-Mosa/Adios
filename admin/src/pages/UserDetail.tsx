import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OrderChatDialog } from "@/components/shared/OrderChatDialog";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserDetailHeader } from "@/features/users/components/UserDetailHeader";
import { UserIdentityCard } from "@/features/users/components/UserIdentityCard";
import { UserActivityStats, UserDetailStats } from "@/features/users/components/UserDetailStats";
import { UserOrderHistory } from "@/features/users/components/UserOrderHistory";

export default function UserDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
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
          <h2 className="text-xl font-bold text-destructive">{t("users.errorLoadingUserDetails")}</h2>
          <p className="text-muted-foreground">{t("users.requestedUserNotFoundDesc")}</p>
          <Button onClick={() => navigate("/users")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("users.backToUsersDirectory")}
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

        <UserActivityStats
          totalSpent={stats.totalSpent}
          averageOrderValue={stats.averageOrderValue}
          completedOrders={stats.completedOrders}
          cancelledOrders={stats.cancelledOrders}
          lastOrderAt={stats.lastOrderAt}
        />

        <UserOrderHistory orders={orders} onViewChat={setSelectedOrderChat} />
      </div>

      <OrderChatDialog orderId={selectedOrderChat} onOpenChange={(open) => !open && setSelectedOrderChat(null)} messages={chatMessages} isLoading={isChatLoading} />
    </DashboardLayout>
  );
}
