import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaggerList } from "@/components/motion/StaggerList";
import { RefreshCw } from "lucide-react";
import { useAppVersions } from "@/features/system/hooks/useAppVersions";
import { PlatformVersionCard } from "@/features/system/components/PlatformVersionCard";

export default function AppVersions() {
  const { ios, setIos, android, setAndroid, isLoading, handleSave, isSaving } = useAppVersions();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">App Version Management</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Control update prompts, store redirects, and forced build checks for iOS & Android.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" /> Loading version settings...
          </div>
        ) : (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlatformVersionCard
              iconBgClassName="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"
              title="Apple iOS Application"
              subtitle="Manage iOS builds for customers & drivers"
              storeLabel="App Store URL"
              storePlaceholder="https://apps.apple.com/app/flavour/..."
              config={ios}
              onChange={setIos}
              onSave={() => handleSave("ios")}
              isSaving={isSaving}
              buttonClassName="rounded-xl w-full"
              buttonLabel="Save iOS Configuration"
            />

            <PlatformVersionCard
              iconBgClassName="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              title="Google Android Application"
              subtitle="Manage Android builds for customers & drivers"
              storeLabel="Play Store URL"
              storePlaceholder="https://play.google.com/store/apps/..."
              config={android}
              onChange={setAndroid}
              onSave={() => handleSave("android")}
              isSaving={isSaving}
              buttonClassName="rounded-xl w-full bg-emerald-600 hover:bg-emerald-700"
              buttonLabel="Save Android Configuration"
            />
          </StaggerList>
        )}
      </div>
    </DashboardLayout>
  );
}
