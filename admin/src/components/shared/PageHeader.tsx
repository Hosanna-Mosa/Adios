interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

/** Title + description block used at the top of a section-card, e.g. the
 *  "User Management" / "View and manage all registered platform users."
 *  header that used to be hand-written inline on every list page. */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}
