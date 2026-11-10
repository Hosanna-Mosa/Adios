import { useTranslation } from "react-i18next";

/**
 * App Store / Google Play buttons. The store listings aren't public yet, so
 * both point at the on-page download section; swap in the real store URLs
 * here once the apps are published.
 */
export const APP_STORE_URL = "#download";
export const PLAY_STORE_URL = "#download";

function AppleLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function GooglePlayLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {/* left — blue */}
      <path
        fill="#00A0FF"
        d="M3.61 1.81 13.4 12l-9.79 10.19A1.5 1.5 0 0 1 3 21.05V2.95c0-.47.22-.88.61-1.14z"
      />
      {/* top — green */}
      <path
        fill="#00D86A"
        d="M3.61 1.81c.4-.26.95-.3 1.5.01L16.5 8.9 13.4 12z"
      />
      {/* right — yellow */}
      <path
        fill="#FFD400"
        d="m16.5 8.9 3.93 2.23c.85.48.85 1.26 0 1.74L16.5 15.1 13.4 12z"
      />
      {/* bottom — red */}
      <path
        fill="#FF3A44"
        d="M13.4 12l3.1 3.1-11.39 7.08c-.55.31-1.1.27-1.5.01z"
      />
    </svg>
  );
}

export function StoreBadges({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const { t } = useTranslation();
  const base =
    tone === "dark"
      ? "border border-black bg-black text-white hover:bg-on-surface"
      : "border border-white/30 bg-black/40 text-white hover:bg-black/60";
  const badges = [
    {
      href: APP_STORE_URL,
      logo: <AppleLogo className="h-7 w-7" />,
      top: t("footer.downloadOnThe"),
      name: t("footer.appStore"),
    },
    {
      href: PLAY_STORE_URL,
      logo: <GooglePlayLogo className="h-7 w-7" />,
      top: t("footer.getItOn"),
      name: t("footer.googlePlay"),
    },
  ];
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {badges.map((b) => (
        <a
          key={b.name}
          href={b.href}
          className={`flex min-w-[160px] items-center gap-2.5 rounded-xl px-4 py-2 transition ${base}`}
        >
          {b.logo}
          <span className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase tracking-wide text-white/80">
              {b.top}
            </span>
            <span className="mt-1 text-[17px] font-semibold tracking-tight">
              {b.name}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
