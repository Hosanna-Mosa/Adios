import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAY_OPTIONS, WINDOW_OPTIONS, useLiveActivity } from "@/features/activity/hooks/useLiveActivity";
import {
  ActiveUsersChart,
  ActivityStatsRow,
  DailyTrendChart,
  RecentEventsTable,
  TopEventsList,
  TopScreensList,
} from "@/features/activity/components/ActivityPanels";

/**
 * What the customer and driver apps are doing right now, from our own event
 * pipeline (apps → POST /analytics/events every 10 s → MongoDB). Firebase
 * Analytics gets the same events but uploads up to an hour late, so this page
 * is the live view and Firebase is the long-term one.
 */
export default function LiveActivity() {
  const { minutes, setMinutes, days, setDays, live, summary } = useLiveActivity();
  const data = live.data;

  return (
    <DashboardLayout searchPlaceholder="Search activity...">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Activity</h1>
            <p className="text-sm text-muted-foreground">
              Customer and driver app usage, updated within seconds
              {data && ` · last updated ${new Date(data.generatedAt).toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Window</span>
            <Select value={String(minutes)} onValueChange={(v) => setMinutes(Number(v))}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WINDOW_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>{m < 60 ? `Last ${m} min` : `Last ${m / 60} h`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {live.isError && (
          <div className="section-card p-4 text-sm text-destructive">
            Could not load live activity: {(live.error as Error)?.message}
          </div>
        )}

        <ActivityStatsRow data={data} minutes={minutes} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActiveUsersChart rows={data?.perMinute ?? []} isLoading={live.isLoading} />
          <TopEventsList items={data?.topEvents ?? []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopScreensList items={data?.topScreens ?? []} />
          <DailyTrendChart
            rows={summary.data?.daily ?? []}
            isLoading={summary.isLoading}
            days={days}
            dayOptions={DAY_OPTIONS}
            onDaysChange={setDays}
          />
        </div>

        <RecentEventsTable events={data?.recent ?? []} />
      </div>
    </DashboardLayout>
  );
}
