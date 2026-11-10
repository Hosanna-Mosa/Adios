import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/shared/Icon";
import { LazyImage } from "@/components/shared/LazyImage";
import { FadeIn } from "@/components/motion/FadeIn";

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=750&q=70`;

const COLLECTIONS = [
  { key: "biryani", image: img("1589302168068-964664d93dc0") },
  { key: "southIndian", image: img("1630383249896-424e482df921") },
  { key: "curries", image: img("1585937421612-70a008356fbe") },
  { key: "streetFood", image: img("1601050690597-df0568f70950") },
  { key: "pizza", image: img("1565299624946-b28f40a0ae38") },
  { key: "grills", image: img("1558030006-450675393462") },
  { key: "healthy", image: img("1546069901-ba9599a7e63c") },
  { key: "desserts", image: img("1551024601-bec78aea704b") },
] as const;

/** Horizontally scrolling "collections" strip of tall photo cards. */
export function CollectionsCarousel() {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="collections" className="bg-white py-16 md:py-24">
      <FadeIn inView className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-on-surface md:text-4xl">
              {t("home.collections.title")}
            </h2>
            <p className="mt-3 text-secondary-app md:text-lg">
              {t("home.collections.subtitle")}
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            {([-1, 1] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollBy(dir)}
                aria-label={
                  dir < 0
                    ? t("home.collections.prev")
                    : t("home.collections.next")
                }
                className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-container bg-white text-primary transition hover:border-primary hover:bg-soft"
              >
                <Icon name={dir < 0 ? "chevron_left" : "chevron_right"} />
              </button>
            ))}
          </div>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-hide -mx-4 flex scroll-px-4 snap-x snap-mandatory sm:scroll-px-6 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6"
        >
          {COLLECTIONS.map((c) => (
            <a
              key={c.key}
              href="#download"
              className="group relative h-72 w-52 shrink-0 snap-start overflow-hidden rounded-2xl sm:w-60 md:h-80"
            >
              <LazyImage
                src={c.image}
                alt={t(`home.collections.items.${c.key}.title`)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                wrapperClassName="h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-display text-lg font-semibold">
                  {t(`home.collections.items.${c.key}.title`)}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
                  {t(`home.collections.items.${c.key}.tagline`)}
                  <Icon name="arrow_right" className="text-base" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
