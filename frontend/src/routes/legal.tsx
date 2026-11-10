import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import {
  LEGAL_AUDIENCES,
  LEGAL_LOADERS,
  LEGAL_TYPES,
  type LegalAudience,
  type LegalDoc,
  type LegalType,
} from "@/features/legal/types";
import {
  LegalDocument,
  SectionTitle,
} from "@/features/legal/components/LegalContent";

const isType = (v: string | undefined): v is LegalType =>
  !!v && (LEGAL_TYPES as string[]).includes(v);
const isAudience = (v: string | null): v is LegalAudience =>
  !!v && (LEGAL_AUDIENCES as string[]).includes(v);

/**
 * /legal/:type — Terms and Conditions, Privacy Policy or Cookie Policy, with
 * tabs for customers, delivery/ride/helper partners and restaurant partners.
 * Content is the exact text of the official PDFs (src/features/legal/content).
 */
export default function LegalPage() {
  const { type } = useParams();
  if (!isType(type)) return <Navigate to="/legal/terms" replace />;
  return <LegalView type={type} />;
}

function LegalView({ type }: { type: LegalType }) {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const [docs, setDocs] = useState<LegalDoc[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState(false);

  // While a legal page is open, block copy/cut anywhere on the page (the
  // content itself is also non-selectable via `select-none` on <main>).
  useEffect(() => {
    const block = (e: ClipboardEvent) => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
    };
  }, []);

  const forParam = params.get("for");
  const audience: LegalAudience = isAudience(forParam) ? forParam : "customers";
  const wantsTermsOfUse =
    type === "terms" && params.get("doc") === "terms-of-use";

  useEffect(() => {
    let alive = true;
    setDocs(null);
    setFailed(false);
    LEGAL_LOADERS[type]()
      .then((d) => alive && setDocs(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [type]);

  const audienceDocs = useMemo(
    () => (docs ?? []).filter((d) => d.audience === audience),
    [docs, audience],
  );
  const doc =
    audienceDocs.find((d) =>
      wantsTermsOfUse ? d.kind === "terms-of-use" : d.kind !== "terms-of-use",
    ) ?? audienceDocs[0];

  // New document → back to the top (or to the linked section).
  useEffect(() => {
    if (!doc) return;
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo({ top: 0 });
    }
    setActiveId(doc.sections[0] ? `${doc.id}-${doc.sections[0].id}` : "");
  }, [doc, hash]);

  // Highlight the section currently being read in the contents list.
  useEffect(() => {
    if (!doc) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-legal-section]"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [doc]);

  const setQuery = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    setParams(p);
  };

  const pageTitle = t(`legal.pageTitle.${type}`);
  const version = doc?.meta.find((m) => m.startsWith("Version"));

  return (
    <main
      className="min-h-screen select-none bg-background"
      // Legal text is read-only on the site: no selecting, copying or cutting.
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Title band */}
      <section className="border-b border-surface-container bg-soft pb-8 pt-28 md:pt-32">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-secondary-app"
          >
            <Link to="/" className="hover:text-primary">
              Adios
            </Link>
            <Icon name="chevron_right" className="text-base" />
            <span>{t("legal.breadcrumb")}</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold text-on-surface md:text-5xl">
            {pageTitle}
          </h1>
          {version && (
            <p className="mt-3 text-sm text-secondary-app">{version}</p>
          )}

          {/* Which legal document */}
          <div className="scrollbar-hide -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {LEGAL_TYPES.map((lt) => (
              <Link
                key={lt}
                to={`/legal/${lt}?for=${audience}`}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  lt === type
                    ? "bg-primary text-white"
                    : "bg-white text-on-surface hover:text-primary"
                }`}
              >
                {t(`legal.pageTitle.${lt}`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Audience tabs */}
      <div className="sticky top-[64px] z-30 border-b border-surface-container bg-white/95 backdrop-blur">
        <div
          role="tablist"
          aria-label={t("legal.audienceLabel")}
          className="scrollbar-hide mx-auto flex max-w-[1200px] gap-6 overflow-x-auto px-4 sm:px-6"
        >
          {LEGAL_AUDIENCES.map((a) => (
            <button
              key={a}
              role="tab"
              type="button"
              aria-selected={a === audience}
              onClick={() => setQuery({ for: a, doc: null })}
              className={`shrink-0 border-b-2 py-3.5 text-sm font-semibold transition ${
                a === audience
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary-app hover:text-on-surface"
              }`}
            >
              {t(`legal.audience.${a}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:py-12">
        {/* Contents */}
        <aside className="lg:sticky lg:top-[132px] lg:max-h-[calc(100vh-150px)] lg:self-start lg:overflow-y-auto">
          {type === "terms" && audienceDocs.length > 1 && (
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-surface-container">
              {(["terms", "terms-of-use"] as const).map((k) => {
                const active =
                  k === "terms-of-use" ? wantsTermsOfUse : !wantsTermsOfUse;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setQuery({ doc: k === "terms-of-use" ? k : null })
                    }
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-primary text-white"
                        : "text-secondary-app hover:text-primary"
                    }`}
                  >
                    {t(`legal.kind.${k}`)}
                  </button>
                );
              })}
            </div>
          )}

          {doc && (
            <nav aria-label={t("legal.contents")}>
              <button
                type="button"
                onClick={() => setTocOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-on-surface shadow-sm ring-1 ring-surface-container lg:pointer-events-none lg:bg-transparent lg:px-0 lg:py-0 lg:pb-3 lg:shadow-none lg:ring-0"
                aria-expanded={tocOpen}
              >
                {t("legal.contents")}
                <Icon
                  name={tocOpen ? "expand_less" : "expand_more"}
                  className="text-xl lg:hidden"
                />
              </button>
              <ol
                className={`mt-2 space-y-0.5 border-l border-surface-container lg:mt-0 lg:block ${
                  tocOpen ? "block" : "hidden"
                }`}
              >
                {doc.sections.map((s) => {
                  const id = `${doc.id}-${s.id}`;
                  const active = id === activeId;
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={() => setTocOpen(false)}
                        className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition ${
                          active
                            ? "border-primary font-semibold text-primary"
                            : "border-transparent text-secondary-app hover:text-on-surface"
                        }`}
                      >
                        <SectionTitle title={s.title} />
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </aside>

        {/* Document */}
        <div className="min-w-0 rounded-2xl border border-surface-container bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          {i18n.language !== "en" && (
            <p className="mb-6 flex items-start gap-2 rounded-xl bg-soft px-4 py-3 text-sm text-on-surface">
              <Icon name="translate" className="mt-0.5 text-lg text-primary" />
              {t("legal.englishOnly")}
            </p>
          )}
          {failed ? (
            <p className="text-secondary-app">{t("legal.loadFailed")}</p>
          ) : doc ? (
            <LegalDocument key={doc.id} doc={doc} />
          ) : (
            <div className="space-y-3" aria-busy="true">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-surface-container"
                  style={{ width: `${90 - (i % 3) * 15}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
