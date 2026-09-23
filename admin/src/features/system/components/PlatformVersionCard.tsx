import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Smartphone, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AppVersionConfig } from "../hooks/useAppVersions";

interface PlatformVersionCardProps {
  iconBgClassName: string;
  title: string;
  subtitle: string;
  storeLabel: string;
  storePlaceholder: string;
  config: AppVersionConfig;
  onChange: (config: AppVersionConfig) => void;
  onSave: () => void;
  isSaving: boolean;
  buttonClassName: string;
  buttonLabel: string;
}

/** One platform's (iOS or Android) version-config card on AppVersions.tsx. */
export function PlatformVersionCard({
  iconBgClassName,
  title,
  subtitle,
  storeLabel,
  storePlaceholder,
  config,
  onChange,
  onSave,
  isSaving,
  buttonClassName,
  buttonLabel,
}: PlatformVersionCardProps) {
  const { t } = useTranslation();
  return (
    <StaggerItem className="section-card p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className={iconBgClassName}>
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("system.latestVersion")}</label>
          <Input
            placeholder="e.g. 1.2.0"
            value={config.latest}
            onChange={e => onChange({ ...config, latest: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("system.minimumRequiredVersion")}</label>
          <Input
            placeholder="e.g. 1.1.0"
            value={config.minRequired}
            onChange={e => onChange({ ...config, minRequired: e.target.value })}
          />
          <span className="text-[10px] text-muted-foreground mt-1 block">{t("system.devicesOlderVersionLockedDesc")}</span>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{storeLabel}</label>
          <div className="flex gap-2 items-center">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={storePlaceholder}
              className="flex-1"
              value={config.storeUrl}
              onChange={e => onChange({ ...config, storeUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onSave}
        disabled={isSaving}
        className={buttonClassName}
      >
        {buttonLabel}
      </Button>
    </StaggerItem>
  );
}
