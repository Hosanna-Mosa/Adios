import { Icon } from "../../../components/shared/Icon";
import { LazyImage } from "../../../components/shared/LazyImage";
import { FadeIn } from "../../../components/motion/FadeIn";

const burgerHeroImg =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80";
const carHeroImg = "/bike_taxi_hero.png";

type Props = {
  activeMode: "food" | "ride";
  setActiveMode: (mode: "food" | "ride") => void;
};

export function Hero({ activeMode, setActiveMode }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">

      {/* Desktop-only full-bleed shaded background images */}
      <div className="hidden lg:block absolute inset-x-0 bottom-0 top-[100px] z-0 pointer-events-none">
        {/* Food background on the right */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full transition-all duration-1000 transform ${
            activeMode === "food"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-12"
          }`}
        >
          <LazyImage
            src={burgerHeroImg}
            alt="Refined Hamburger Taste"
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
          />
          {/* Smooth transition from the left (white) to transparent */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
        </div>

        {/* Rides background on the left */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-1000 transform ${
            activeMode === "ride"
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-12"
          }`}
        >
          <LazyImage
            src={carHeroImg}
            alt="Executive Mobility Vehicle"
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
          />
          {/* Smooth transition from the right (white) to transparent */}
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/20 to-transparent" />
        </div>
      </div>


      {/* State Toggle Buttons */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-surface-container p-1 rounded-lg flex items-center gap-1 shadow-sm border border-secondary-fixed-dim">
          <button
            onClick={() => setActiveMode("food")}
            className={`px-8 py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeMode === "food"
                ? "bg-primary text-white shadow-md"
                : "text-secondary-app hover:text-primary"
            }`}
          >
            Food
          </button>
          <button
            onClick={() => setActiveMode("ride")}
            className={`px-8 py-2.5 rounded font-semibold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeMode === "ride"
                ? "bg-brand-kinetic text-on-surface shadow-md"
                : "text-secondary-app hover:text-primary"
            }`}
          >
            Rides
          </button>
        </div>
      </div>

      {/* Hero Content Container (Flips columns layout with transitions) */}
      <FadeIn className="max-w-[1440px] mx-auto w-full px-10 md:px-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 relative z-10 min-h-[80vh] lg:min-h-screen pt-32 lg:pt-0">

        {/* Column 1 (Left) - Displays Food Text in Food mode, Rides Image in Ride mode */}
        <div className="relative h-[420px] lg:h-[550px] flex flex-col justify-center">
          {/* Food Mode Left Content: Text Block */}
          <div
            className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 transform ${
              activeMode === "food"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-12 pointer-events-none"
            }`}
          >
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-kinetic mb-4 block font-display text-left">
              A Lifestyle Ecosystem
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-[1.1] mb-6 font-display tracking-tight text-left">
              Flavor: Movement <br />
              and Taste, Refined.
            </h1>
            <p className="text-secondary-app text-base md:text-lg mb-8 max-w-lg leading-relaxed font-body text-left">
              Navigate your day with executive-level precision. From world-class dining to seamless transportation and expert logistics, your world is now delivered and driven.
            </p>

            {/* App Store Badges */}
            <div className="flex gap-4">
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-5 py-2.5 rounded hover:bg-primary transition-all"
              >
                <Icon name="grid_view" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">Download on the</span>
                  <span className="text-[15px] font-bold mt-0.5">App Store</span>
                </div>
              </a>
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-5 py-2.5 rounded hover:bg-primary transition-all"
              >
                <Icon name="play_arrow" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">Get it on</span>
                  <span className="text-[15px] font-bold mt-0.5">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Rides Mode Left Content: Image Block (Sleek Car on Left) */}
          <div
            className={`absolute inset-0 rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform lg:hidden ${
              activeMode === "ride"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-12 pointer-events-none"
            }`}
          >
            <LazyImage
              src={carHeroImg}
              alt="Executive Mobility Vehicle"
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>

        {/* Column 2 (Right) - Displays Food Image in Food mode, Rides Text in Ride mode */}
        <div className="relative h-[420px] lg:h-[550px] flex flex-col justify-center">
          {/* Food Mode Right Content: Image Block (Premium Burger on Right) */}
          <div
            className={`absolute inset-0 rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform lg:hidden ${
              activeMode === "food"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-12 pointer-events-none"
            }`}
          >
            <LazyImage
              src={burgerHeroImg}
              alt="Refined Hamburger Taste"
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Rides Mode Right Content: Text Block */}
          <div
            className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 transform ${
              activeMode === "ride"
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-12 pointer-events-none"
            }`}
          >
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-kinetic mb-4 block font-display text-left">
              Executive Mobility
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-[1.1] mb-6 font-display tracking-tight text-left">
              Executive Motion, <br />
              Redefined.
            </h1>
            <p className="text-secondary-app text-base md:text-lg mb-8 max-w-lg leading-relaxed font-body text-left">
              Professional transportation at your command. From airport transfers to city commutes, experience the gold standard of travel.
            </p>

            {/* App Store Badges */}
            <div className="flex gap-4">
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-5 py-2.5 rounded hover:bg-primary transition-all"
              >
                <Icon name="grid_view" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">Download on the</span>
                  <span className="text-[15px] font-bold mt-0.5">App Store</span>
                </div>
              </a>
              <a
                href="#download"
                className="flex items-center gap-3 bg-on-surface text-white px-5 py-2.5 rounded hover:bg-primary transition-all"
              >
                <Icon name="play_arrow" className="text-xl" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">Get it on</span>
                  <span className="text-[15px] font-bold mt-0.5">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

      </FadeIn>
    </section>
  );
}
