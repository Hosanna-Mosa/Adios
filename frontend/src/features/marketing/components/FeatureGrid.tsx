import { Icon } from "../../../components/shared/Icon";
import { FadeIn } from "../../../components/motion/FadeIn";

type Props = { activeMode: "food" | "ride" };

export function FeatureGrid({ activeMode }: Props) {
  return (
    <section
      id="services"
      className="py-24 bg-white border-y border-surface-container"
    >
      <FadeIn inView className="max-w-[1440px] mx-auto px-10 md:px-20">
        {/* Header text container */}
        <div className="text-center mb-16 max-w-2xl mx-auto h-[120px] relative">
          {/* Food text header */}
          <div
            className={`absolute inset-x-0 top-0 transition-all duration-700 transform ${
              activeMode === "food"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-display mb-4">
              One Platform, Refined Life
            </h2>
            <p className="text-secondary-app text-sm md:text-base leading-relaxed font-body">
              Flavor integrates three essential pillars of the modern lifestyle
              into a single, seamless executive experience.
            </p>
          </div>

          {/* Rides text header */}
          <div
            className={`absolute inset-x-0 top-0 transition-all duration-700 transform ${
              activeMode === "ride"
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-display mb-4">
              Movement, Restructured
            </h2>
            <p className="text-secondary-app text-sm md:text-base leading-relaxed font-body">
              Our custom mobility workflows ensure you travel with max
              efficiency and zero friction.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="relative min-h-[250px]">
          {/* Food Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 transform ${
              activeMode === "food"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-8 pointer-events-none absolute inset-0"
            }`}
          >
            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="restaurant" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                Culinary Excellence
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Access a curated selection of the city's finest kitchens. Every
                meal is handled with white-glove care from chef to table.
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="directions_car" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                Executive Motion
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Premium transportation for the discerning professional.
                Professional chauffeurs and high-end vehicles at your command.
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="local_shipping" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                Swift Logistics
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Secure, real-time parcel delivery and personal tasks managed by
                our elite logistics network with total discretion.
              </p>
            </div>
          </div>

          {/* Rides Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 transform ${
              activeMode === "ride"
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-8 pointer-events-none absolute inset-0"
            }`}
          >
            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="flight" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                Airport Transfers
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Punctual, stress-free transit to and from major hubs. Real-time
                flight tracking ensures we're always there before you land.
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="apartment" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                City Commutes
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Reliable point-to-point travel within the metropolitan core.
                Turn transit time into productive working minutes.
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="schedule" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                Hourly Hire
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                Dedicated vehicle and chauffeur at your disposal for multi-stop
                meetings or full-day itineraries.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
