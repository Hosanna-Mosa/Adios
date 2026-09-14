import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { fadeIn } from "@/components/motion/variants";
import {
  User, 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  Calendar, 
  Briefcase, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2,
  MessageSquare
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface OrderItem {
  _id: string;
  serviceType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  stops: { address?: string }[];
}

interface UserDetailResponse {
  user: UserProfile;
  stats: {
    totalOrders: number;
    deliveryOrders: number;
    ridesOrders: number;
    helperOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderAt: string | null;
  };
  orders: OrderItem[];
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOrderChat, setSelectedOrderChat] = useState<string | null>(null);

  const { data: chatMessages = [], isLoading: isChatLoading } = useQuery<any[]>({
    queryKey: ["order-chat", selectedOrderChat],
    queryFn: () => adminFetch<any[]>(`/admin/orders/${selectedOrderChat}/chat`),
    enabled: !!selectedOrderChat
  });

  const { data, isLoading, error } = useQuery<UserDetailResponse>({
    queryKey: ["admin-user-detail", id],
    queryFn: () => adminFetch<UserDetailResponse>(`/admin/users/${id}`),
    enabled: !!id
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (isBlocked: boolean) => 
      adminFetch(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isBlocked })
      }),
    onSuccess: (res: any) => {
      const statusText = res.user.isBlocked ? "blocked" : "unblocked";
      toast.success(`User has been ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update block status");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User account deleted successfully");
      navigate("/users");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete user");
    }
  });

  const handleDeleteClick = () => {
    if (confirm("WARNING: This will permanently delete this user and their associated records. Are you sure?")) {
      deleteUserMutation.mutate();
    }
  };

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
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/users")} className="gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
          <div className="flex gap-2">
            <Button
              variant={user.isBlocked ? "outline" : "destructive"}
              className="rounded-xl gap-2"
              onClick={() => toggleBlockMutation.mutate(!user.isBlocked)}
              disabled={toggleBlockMutation.isPending}
            >
              {user.isBlocked ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-green-500" /> Lift Suspension
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" /> Suspend/Ban Account
                </>
              )}
            </Button>
            <Button variant="destructive" className="rounded-xl gap-2" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.isBlocked ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                }`}>
                  {user.isBlocked ? "Suspended" : "Active"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">UID: {user._id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-2xl">
            <Calendar className="h-4 w-4" />
            <span>Registered On: {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <ShoppingBag className="h-5 w-5 text-blue-500 mx-auto" />
            <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Hires</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <Truck className="h-5 w-5 text-indigo-500 mx-auto" />
            <p className="text-2xl font-bold text-foreground">{stats.deliveryOrders}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Deliveries</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <ArrowLeft className="h-5 w-5 rotate-135 text-green-500 mx-auto" />
            <p className="text-2xl font-bold text-foreground">{stats.ridesOrders}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rides Hired</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <Briefcase className="h-5 w-5 text-orange-500 mx-auto" />
            <p className="text-2xl font-bold text-foreground">{stats.helperOrders}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Helper Tasks</p>
          </StaggerItem>
        </StaggerList>

        <StaggerList className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <p className="text-2xl font-bold text-foreground">₹{(stats.totalSpent ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Spent</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <p className="text-2xl font-bold text-foreground">₹{(stats.averageOrderValue ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg Order</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{stats.completedOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <p className="text-2xl font-bold text-foreground">{stats.cancelledOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cancelled</p>
          </StaggerItem>
          <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
            <p className="text-2xl font-bold text-foreground">
              {stats.lastOrderAt ? new Date(stats.lastOrderAt).toLocaleDateString() : "—"}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last Order</p>
          </StaggerItem>
        </StaggerList>

        {/* Order history */}
        {/* Activity / Order History */}
        <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">Order & Execution History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs">
                    <th className="table-header-text text-left px-4 py-2.5">Order ID</th>
                    <th className="table-header-text text-left px-4 py-2.5">Service Type</th>
                    <th className="table-header-text text-left px-4 py-2.5">Fare</th>
                    <th className="table-header-text text-left px-4 py-2.5">Status</th>
                    <th className="table-header-text text-left px-4 py-2.5">Date</th>
                    <th className="table-header-text text-left px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders recorded for this customer account.</td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                    {orders.map(order => (
                      <motion.tr
                        key={order._id}
                        layout
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-primary">
                          <Link to={`/live-orders/${order._id}`} className="hover:underline">
                            {order._id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 uppercase font-medium">{order.serviceType}</td>
                        <td className="px-4 py-3 font-semibold">₹{order.totalPrice}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                            order.status === "COMPLETED" || order.status === "DELIVERED" || order.status === "delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] gap-1 rounded-lg"
                            onClick={() => setSelectedOrderChat(order._id)}
                          >
                            <MessageSquare className="h-3 w-3" /> View Chat
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      {/* Order Chat Dialog */}
      <Dialog open={!!selectedOrderChat} onOpenChange={(open) => !open && setSelectedOrderChat(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Chat Log for {selectedOrderChat}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 h-[400px] overflow-y-auto pr-2">
            {isChatLoading ? (
              <div className="text-center py-6 text-muted-foreground">Loading chat messages...</div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No chat history recorded for this trip.</div>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg) => {
                  const isDriver = msg.role === "driver";
                  return (
                    <div key={msg._id} className={`flex flex-col ${isDriver ? "items-start" : "items-end"}`}>
                      <span className="text-[10px] text-muted-foreground font-semibold px-1 mb-0.5">
                        {msg.senderId?.name || (isDriver ? "Driver" : "User")} ({msg.role.toUpperCase()})
                      </span>
                      <div className={`px-3 py-2 rounded-2xl max-w-[80%] text-xs ${
                        isDriver 
                          ? "bg-muted text-foreground rounded-tl-none" 
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground px-1 mt-0.5">{msg.time || new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
