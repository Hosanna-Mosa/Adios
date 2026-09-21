import { Briefcase, ShoppingBag, ArrowLeft, Truck } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface UserDetailStatsProps {
  totalOrders: number;
  deliveryOrders: number;
  ridesOrders: number;
  helperOrders: number;
}

/** The 4-card order stats row on UserDetail. */
export function UserDetailStats({ totalOrders, deliveryOrders, ridesOrders, helperOrders }: UserDetailStatsProps) {
  return (
    <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <ShoppingBag className="h-5 w-5 text-blue-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Hires</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Truck className="h-5 w-5 text-indigo-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{deliveryOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Deliveries</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <ArrowLeft className="h-5 w-5 rotate-135 text-green-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{ridesOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rides Hired</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Briefcase className="h-5 w-5 text-orange-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{helperOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Helper Tasks</p>
      </StaggerItem>
    </StaggerList>
  );
}
