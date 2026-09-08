import { Icon } from "../../../components/shared/Icon";
import { LazyImage } from "../../../components/shared/LazyImage";
import { FadeIn } from "../../../components/motion/FadeIn";

const mockupBurgerImg =
  "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80";

type Props = { activeMode: "food" | "ride" };

export function ExperienceShowcase({ activeMode }: Props) {
  return (
    <section id="experience" className="py-24 bg-surface-soft">
      <FadeIn inView className="max-w-[1440px] mx-auto px-10 md:px-20">
        <div className="relative min-h-[550px]">
          {/* FOOD SHOWCASE */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 items-center gap-16 transition-all duration-700 transform ${
              activeMode === "food"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none absolute inset-0"
            }`}
          >
            {/* Left Side CSS Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-[290px] h-[580px] rounded-[48px] bg-black p-3.5 shadow-2xl border-4 border-neutral-800 ring-8 ring-neutral-900 ring-opacity-20 flex-shrink-0">
                {/* Speaker Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                </div>

                {/* Mock Screen Content */}
                <div className="w-full h-full bg-surface-soft rounded-[34px] overflow-hidden flex flex-col font-sans relative border border-neutral-900/10 text-left pt-6 pb-2">
                  {/* Address Selection */}
                  <div className="px-4 py-2 border-b border-surface-container bg-white flex justify-between items-center">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-secondary-app block">
                        DELIVERY ADDRESS
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-primary">
                          Executive Suite 402
                        </span>
                        <Icon
                          name="keyboard_arrow_down"
                          className="text-xs text-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
                        <Icon
                          name="search"
                          className="text-xs text-neutral-500"
                        />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center">
                        <Icon name="person" className="text-xs text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* App Tabs Selection */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-white border-b border-surface-container text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        <Icon
                          name="assignment"
                          className="text-xs text-neutral-600"
                        />
                      </div>
                      <span className="text-[8px] font-bold text-secondary-app mt-1">
                        Tasks
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        <Icon
                          name="directions_car"
                          className="text-xs text-neutral-600"
                        />
                      </div>
                      <span className="text-[8px] font-bold text-secondary-app mt-1">
                        Rides
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Icon
                          name="restaurant"
                          className="text-xs text-white"
                        />
                      </div>
                      <span className="text-[8px] font-bold text-primary mt-1">
                        Food
                      </span>
                    </div>
                  </div>

                  {/* Greeting & Custom Pills */}
                  <div className="p-4 bg-white">
                    <h4 className="text-sm font-bold text-primary mb-2 font-display">
                      Good Evening, Julian
                    </h4>
                    <div className="flex gap-1.5 overflow-x-hidden">
                      <span className="text-[8px] font-extrabold px-2.5 py-1 bg-primary text-white rounded-full">
                        All Food
                      </span>
                      <span className="text-[8px] font-bold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                        Michelin
                      </span>
                      <span className="text-[8px] font-bold px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                        Artisan
                      </span>
                    </div>
                  </div>

                  {/* Restaurant card item */}
                  <div className="mx-3 mt-3 bg-white border border-surface-container rounded-lg overflow-hidden shadow-sm flex flex-col">
                    <div className="h-28 bg-neutral-200 relative">
                      <LazyImage
                        src={mockupBurgerImg}
                        alt="Burger"
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                      />
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
                        PURE VEG
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-primary font-display">
                          The Burger Club
                        </span>
                        <Icon
                          name="favorite"
                          className="text-xs text-neutral-300"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[8px] text-secondary-app font-medium">
                        <span className="text-amber-500 font-bold flex items-center">
                          4.9 ★
                        </span>
                        <span>(1.2k+ reviews)</span>
                        <span>•</span>
                        <span>15-20 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Sticky search floating box */}
                  <div className="absolute bottom-4 left-3 right-3 bg-white p-2.5 rounded-lg border border-secondary-fixed-dim shadow-md flex items-center gap-2">
                    <Icon name="search" className="text-primary text-sm" />
                    <span className="text-[9px] text-secondary-app font-medium">
                      Order, book, or ship anything
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Text Block */}
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-6 tracking-tight">
                Command Your Lifestyle
              </h2>
              <p className="text-secondary-app text-base mb-8 leading-relaxed font-body">
                Unlock the full power of Flavor with our unified mobile
                interface. Switch effortlessly between services—book a black car
                for your evening, order a gourmet meal for your arrival, or have
                documents delivered across town—all within a single, secure
                ecosystem.
              </p>

              {/* Feature Bullet Points */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-kinetic/15 flex items-center justify-center text-brand-kinetic shrink-0 mt-1">
                    <Icon name="check" className="text-sm font-bold" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Unified Service Hub
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      One app for all your movement, culinary, and logistical
                      needs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-kinetic/15 flex items-center justify-center text-brand-kinetic shrink-0 mt-1">
                    <Icon name="check" className="text-sm font-bold" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Global Priority Access
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      Elite status across all service tiers for consistent
                      excellence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-kinetic/15 flex items-center justify-center text-brand-kinetic shrink-0 mt-1">
                    <Icon name="check" className="text-sm font-bold" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Intelligent Routing
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      Predictive scheduling that anticipates your next move.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIDES SHOWCASE */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 items-center gap-16 transition-all duration-700 transform ${
              activeMode === "ride"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none absolute inset-0"
            }`}
          >
            {/* Left Side Text Block */}
            <div className="text-left order-2 lg:order-1">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-kinetic mb-4 block font-display">
                The Experience
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-display mb-6 tracking-tight">
                Your Private Fleet, <br />
                One Tap Away.
              </h2>

              {/* Feature Bullet Points */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-surface-container text-primary shrink-0 shadow-sm">
                    <Icon name="hub" className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Unified Service Hub
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      One elite app for all your executive movement and transit
                      needs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-surface-container text-primary shrink-0 shadow-sm">
                    <Icon name="star" className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Global Priority Standards
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      Experience a consistent standard of chauffeur excellence
                      across all service tiers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-surface-container text-primary shrink-0 shadow-sm">
                    <Icon name="insights" className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary font-display mb-1">
                      Intelligent Predictive Routing
                    </h4>
                    <p className="text-sm text-secondary-app leading-relaxed font-body">
                      Our AI anticipates your schedule, suggesting airport
                      transfers or city commutes when you need them most.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Phone Mockup (Map interface) */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative w-[290px] h-[580px] rounded-[48px] bg-black p-3.5 shadow-2xl border-4 border-neutral-800 ring-8 ring-neutral-900 ring-opacity-20 flex-shrink-0">
                {/* Speaker Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                </div>

                {/* Mock Screen Content (Map View) */}
                <div className="w-full h-full bg-device-frame rounded-[34px] overflow-hidden flex flex-col font-sans relative border border-neutral-900/10 text-left pt-6 pb-2">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 z-0 bg-device-screen">
                    {/* Map lines */}
                    <svg
                      className="w-full h-full stroke-white stroke-2 opacity-60"
                      fill="none"
                    >
                      <line x1="0" y1="100" x2="300" y2="150" />
                      <line x1="150" y1="0" x2="100" y2="600" />
                      <line x1="50" y1="200" x2="250" y2="400" />
                      <path d="M 0 350 Q 150 300 300 450" />
                      <path
                        d="M 50 100 Q 200 400 300 500"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                        className="opacity-90"
                      />
                    </svg>

                    {/* Source Pin */}
                    <div className="absolute top-[160px] left-[70px] w-3 h-3 bg-green-500 rounded-full border border-white shadow flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                    {/* Destination Pin */}
                    <div className="absolute top-[410px] left-[220px] w-5 h-5 bg-primary rounded-full border-2 border-white shadow flex items-center justify-center text-white">
                      <Icon name="location_on" className="text-[10px]" />
                    </div>
                  </div>

                  {/* Floating Map Search Details */}
                  <div className="absolute top-8 left-3 right-3 bg-white p-3 rounded-lg border border-secondary-fixed-dim shadow-lg z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0" />
                      <span className="text-[10px] font-bold text-primary truncate">
                        Guindy National Park
                      </span>
                    </div>
                    <div className="h-px bg-surface-container" />
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-brand-kinetic rounded-full shrink-0" />
                      <span className="text-[10px] font-bold text-primary truncate">
                        Taj Coromandel
                      </span>
                    </div>
                  </div>

                  {/* Bottom Sheet Select Car */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white p-3 rounded-xl border border-secondary-fixed-dim shadow-2xl z-10 flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Select Vehicle
                      </span>
                      <span className="text-[8px] font-bold text-secondary-app">
                        3 cars available
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2 border border-brand-kinetic/40 bg-brand-kinetic/5 rounded flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Icon
                            name="directions_car"
                            className="text-sm text-primary"
                          />
                          <div className="leading-none">
                            <span className="text-[9px] font-bold text-primary block">
                              Executive Sedan
                            </span>
                            <span className="text-[7px] text-secondary-app">
                              BMW 5-Series or Mercedes E-Class
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-primary">
                          $45.00
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-primary text-white text-[10px] font-bold py-2.5 rounded hover:bg-primary/90 transition-all text-center">
                      Confirm Elite Ride
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
