import { FadeIn } from "@/components/motion/FadeIn";
import { CheckCircle, Truck as TruckIcon, Package } from "lucide-react";
import type { TimelineStep } from "../orderDetailTypes";

interface OrderTimelineProps {
  timelineSteps: TimelineStep[];
}

/** The "Order Logistics Flow" timeline card on OrderDetail.tsx. */
export function OrderTimeline({ timelineSteps }: OrderTimelineProps) {
  return (
    <FadeIn className="section-card p-6 mb-6">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-6">Order Logistics Flow</p>
      <div className="space-y-0">
        {timelineSteps.map((step, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                step.status === "completed" ? "bg-primary text-primary-foreground" :
                step.status === "in_progress" ? "bg-primary/20 text-primary border-2 border-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {step.status === "completed" ? <CheckCircle className="h-4 w-4" /> :
                 step.status === "in_progress" ? <TruckIcon className="h-4 w-4" /> :
                 <Package className="h-4 w-4" />}
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={`w-0.5 h-16 ${step.status === "completed" ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
            <div className="pb-8">
              {step.time && <p className="text-xs text-primary font-medium">{step.time}</p>}
              {step.label && <p className={`text-xs font-semibold ${step.status === "in_progress" ? "text-primary" : "text-muted-foreground"}`}>
                {step.label} {step.status === "in_progress" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary ml-1 animate-pulse-dot" />}
              </p>}
              <p className={`text-sm font-semibold mt-0.5 ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{step.title}</p>
              <p className={`text-xs mt-0.5 ${step.status === "pending" ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
