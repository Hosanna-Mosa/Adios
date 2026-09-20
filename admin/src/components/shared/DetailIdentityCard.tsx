import { ReactNode } from "react";

interface DetailIdentityCardProps {
  icon: ReactNode;
  title: string;
  badges?: ReactNode;
  subtitle: ReactNode;
  rightContent: ReactNode;
}

/**
 * The identity-card shell shared by DriverDetail (item #6) and UserDetail
 * (item #11): an avatar circle + name + badges + subtitle on the left, and
 * an entity-specific block on the right (zone info for a driver,
 * registration date for a user) passed in as `rightContent` rather than
 * templated here, since that side's shape genuinely differs per entity.
 */
export function DetailIdentityCard({ icon, title, badges, subtitle, rightContent }: DetailIdentityCardProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {badges}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      {rightContent}
    </div>
  );
}
