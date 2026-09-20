import { Icon } from "../../../components/shared/Icon";
import { FadeIn } from "../../../components/motion/FadeIn";

type Props = { activeMode: "food" | "ride" };

export function CtaBand({ activeMode }: Props) {
  return (
    <section
      id="download"
      className="py-24 bg-white border-t border-surface-container relative"
    >
      <FadeIn inView className="max-w-[1440px] mx-auto px-10 md:px-20">
        <div className="relative min-h-[350px]">
          {/* FOOD CTA */}
          <div
            className={`absolute inset-0 bg-surface-container-low border border-surface-container rounded-lg p-10 md:p-16 flex flex-col justify-center items-center text-center transition-all duration-700 transform ${
              activeMode === "food"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-4">
              Step Into the World of Flavor
            </h2>
            <p className="text-secondary-app text-base max-w-lg mb-8 leading-relaxed font-body">
              Elevate your standards. Join a community of discerning individuals
              who value time, quality, and the art of living well.
            </p>

            {/* App Store Badges */}
            <div className="flex gap-4 mb-6">
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-6 py-3 rounded hover:bg-primary transition-all"
              >
                <Icon name="grid_view" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                    Download on the
                  </span>
                  <span className="text-[15px] font-bold mt-0.5">
                    App Store
                  </span>
                </div>
              </a>
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-6 py-3 rounded hover:bg-primary transition-all"
              >
                <Icon name="play_arrow" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                    Get it on
                  </span>
                  <span className="text-[15px] font-bold mt-0.5">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
            <span className="text-xs text-secondary-app font-medium font-body">
              Serving major global hubs. Movement, Taste, and Logistics,
              Refined.
            </span>
          </div>

          {/* RIDES CTA */}
          <div
            className={`absolute inset-0 bg-primary rounded-lg p-10 md:p-16 flex flex-col justify-center items-center text-center transition-all duration-700 transform overflow-hidden ${
              activeMode === "ride"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {/* Dot Grid Background Effect */}
            <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display mb-4">
                Ready for the Next Level?
              </h2>
              <p className="text-white/70 text-base max-w-lg mb-8 leading-relaxed font-body">
                Join the exclusive circle of executives who trust Flavor for
                their daily mobility and culinary needs.
              </p>

              {/* Custom CTA Action Buttons */}
              <div className="flex gap-4">
                <a
                  href="#download"
                  className="bg-brand-kinetic text-on-surface font-semibold text-sm px-8 py-3.5 rounded hover:bg-brand-kinetic/90 hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  Get Started
                </a>
                <a
                  href="#sales"
                  className="border border-white/20 text-white font-semibold text-sm px-8 py-3.5 rounded hover:bg-white/5 hover:scale-105 active:scale-95 transition-all"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
