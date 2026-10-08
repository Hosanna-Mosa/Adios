import { Activity, Smartphone, Truck, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { FadeIn } from "@/components/motion/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivityApp, DailyRow, LiveActivity, MinuteRow, RecentEvent, TopClickedItem, TopEvent, TopOrderedItem, TopScreen } from "../types";

// Same two hues everywhere on the page so "customer" and "driver" read the
// same in every chart, list and badge.
const APP_COLORS: Record<ActivityApp, string> = {
  customer: "hsl(185, 80%, 28%)",
  driver: "hsl(32, 90%, 48%)",
};
const APP_LABEL: Record<ActivityApp, string> = { customer: "Customer", driver: "Driver" };
const AXIS_TICK = { fontSize: 11, fill: "hsl(215,15%,50%)" };
const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid hsl(214,20%,90%)", fontSize: 12 };

// The page refetches every 15 s; re-running the entrance animation on each
// refresh makes the charts jump, so they draw straight to the new data.
const NO_ANIMATION = { isAnimationActive: false } as const;

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function AppBadge({ app }: { app: ActivityApp }) {
  return (
    <Badge variant="outline" className="font-medium" style={{ color: APP_COLORS[app], borderColor: APP_COLORS[app] }}>
      {APP_LABEL[app]}
    </Badge>
  );
}

export function ActivityStatsRow({ data, minutes }: { data?: LiveActivity; minutes: number }) {
  const c = data?.apps.customer;
  const d = data?.apps.driver;
  const fmt = (n?: number) => (n === undefined ? "—" : n.toLocaleString());
  return (
    <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StaggerItem>
        <StatCard icon={<Smartphone className="h-5 w-5" />} label="Customers active now" value={fmt(c?.activeNow)} subtitle="last 5 minutes" badgeColor="muted" />
      </StaggerItem>
      <StaggerItem>
        <StatCard icon={<Truck className="h-5 w-5" />} label="Drivers active now" value={fmt(d?.activeNow)} subtitle="last 5 minutes" badgeColor="muted" />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label={`Active users · ${minutes} min`}
          value={c && d ? fmt(c.activeUsers + d.activeUsers) : "—"}
          subtitle={c && d ? `${c.activeUsers} customer · ${d.activeUsers} driver` : undefined}
          badgeColor="muted"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label={`Events · ${minutes} min`}
          value={c && d ? fmt(c.events + d.events) : "—"}
          subtitle={c && d ? `${c.signedInUsers + d.signedInUsers} signed-in users` : undefined}
          badgeColor="muted"
        />
      </StaggerItem>
    </StaggerList>
  );
}

export function ActiveUsersChart({ rows, isLoading }: { rows: MinuteRow[]; isLoading: boolean }) {
  return (
    <FadeIn className="lg:col-span-2 section-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Active users per minute</h3>
      <p className="text-xs text-muted-foreground mb-4">Refreshes every 15 seconds</p>
      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214,20%,92%)" />
            <XAxis dataKey="minute" tickFormatter={timeLabel} axisLine={false} tickLine={false} tick={AXIS_TICK} minTickGap={24} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} width={28} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => timeLabel(String(v))} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {(["customer", "driver"] as const).map((app) => (
              <Area key={app} type="monotone" dataKey={app} name={APP_LABEL[app]} stroke={APP_COLORS[app]} fill={APP_COLORS[app]} fillOpacity={0.12} strokeWidth={2} {...NO_ANIMATION} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </FadeIn>
  );
}

function TopList<T>({ title, items, label, value, empty }: {
  title: string;
  items: T[];
  label: (item: T) => { app: ActivityApp; text: string };
  value: (item: T) => number;
  empty: string;
}) {
  const max = Math.max(1, ...items.map(value));
  return (
    <FadeIn delay={0.05} className="section-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 8).map((item, i) => {
            const { app, text } = label(item);
            return (
              <li key={i}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <AppBadge app={app} />
                    <span className="truncate text-foreground">{text}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">{value(item).toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(value(item) / max) * 100}%`, background: APP_COLORS[app] }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </FadeIn>
  );
}

export function TopEventsList({ items }: { items: TopEvent[] }) {
  return (
    <TopList title="Top actions" items={items} label={(e) => ({ app: e.app, text: e.name })} value={(e) => e.count} empty="No actions in this window yet." />
  );
}

export function TopScreensList({ items }: { items: TopScreen[] }) {
  return (
    <TopList title="Top screens" items={items} label={(s) => ({ app: s.app, text: s.screen ?? "(unknown)" })} value={(s) => s.views} empty="No screen views in this window yet." />
  );
}

export function DailyTrendChart({ rows, isLoading, days, dayOptions, onDaysChange }: {
  rows: DailyRow[];
  isLoading: boolean;
  days: number;
  dayOptions: readonly number[];
  onDaysChange: (days: number) => void;
}) {
  return (
    <FadeIn delay={0.05} className="lg:col-span-2 section-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Daily active users</h3>
        <Select value={String(days)} onValueChange={(v) => onDaysChange(Number(v))}>
          <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {dayOptions.map((d) => (
              <SelectItem key={d} value={String(d)}>Last {d} days</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No activity recorded yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214,20%,92%)" />
            <XAxis dataKey="day" tickFormatter={(d) => String(d).slice(5)} axisLine={false} tickLine={false} tick={AXIS_TICK} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} width={28} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="customerUsers" name="Customer" fill={APP_COLORS.customer} radius={[4, 4, 0, 0]} {...NO_ANIMATION} />
            <Bar dataKey="driverUsers" name="Driver" fill={APP_COLORS.driver} radius={[4, 4, 0, 0]} {...NO_ANIMATION} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </FadeIn>
  );
}

const describe = (e: RecentEvent) => {
  const p = e.props ?? {};
  if (e.name === "screen_view") return String(p.screen ?? "");
  return Object.entries(p)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
};

export function RecentEventsTable({ events }: { events: RecentEvent[] }) {
  return (
    <FadeIn delay={0.1} className="section-card p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Latest events</h3>
        {events.length > 0 && <span className="text-xs text-muted-foreground">newest {events.length}</span>}
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet — events appear here within about 10 seconds of happening in the apps.</p>
      ) : (
        <div className="max-h-[480px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[110px]">Time</TableHead>
              <TableHead className="w-[100px]">App</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e._id}>
                <TableCell className="tabular-nums text-muted-foreground whitespace-nowrap">
                  {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </TableCell>
                <TableCell><AppBadge app={e.app} /></TableCell>
                <TableCell className="font-medium">{e.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-[320px] truncate">{describe(e)}</TableCell>
                <TableCell className="text-muted-foreground">{e.user?.name || e.user?.phone || "Signed out"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </FadeIn>
  );
}

/** One ranked list of food items: name, restaurant, a bar and the figure. */
function ItemRanking<T extends { itemId: string; name?: string; vendorName?: string }>({ title, subtitle, items, value, detail, color, empty, isLoading }: {
  title: string;
  subtitle: string;
  items: T[];
  value: (item: T) => number;
  detail: (item: T) => string;
  color: string;
  empty: string;
  isLoading: boolean;
}) {
  const max = Math.max(1, ...items.map(value));
  return (
    <FadeIn delay={0.05} className="section-card p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={`${item.itemId}-${i}`}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-5 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">{item.name || "(unnamed item)"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.vendorName || "Unknown restaurant"} · {detail(item)}</span>
                  </span>
                </span>
                <span className="font-semibold tabular-nums text-foreground">{value(item).toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(value(item) / max) * 100}%`, background: color }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </FadeIn>
  );
}

export function TopClickedItemsList({ items, isLoading }: { items: TopClickedItem[]; isLoading: boolean }) {
  return (
    <ItemRanking
      title="Most clicked food items"
      subtitle="Taps on an item in a restaurant menu"
      items={items}
      value={(i) => i.clicks}
      detail={(i) => `${i.uniqueUsers.toLocaleString()} ${i.uniqueUsers === 1 ? "user" : "users"}`}
      color={APP_COLORS.customer}
      empty="No item taps recorded in this period yet."
      isLoading={isLoading}
    />
  );
}

export function TopOrderedItemsList({ items, isLoading }: { items: TopOrderedItem[]; isLoading: boolean }) {
  return (
    <ItemRanking
      title="Most ordered food items"
      subtitle="Units ordered, from real orders (cancelled excluded)"
      items={items}
      value={(i) => i.quantity}
      detail={(i) => `${i.orders.toLocaleString()} ${i.orders === 1 ? "order" : "orders"} · ₹${Math.round(i.revenue).toLocaleString()}`}
      color={APP_COLORS.driver}
      empty="No food orders in this period yet."
      isLoading={isLoading}
    />
  );
}
