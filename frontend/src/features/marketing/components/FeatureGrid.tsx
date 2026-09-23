import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { FadeIn } from "../../../components/motion/FadeIn";

type Props = { activeMode: "food" | "ride" };

export function FeatureGrid({ activeMode }: Props) {
  const { t } = useTranslation();
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
              {t("featureGrid.foodTitle")}
            </h2>
            <p className="text-secondary-app text-sm md:text-base leading-relaxed font-body">
              {t("featureGrid.foodSubtitle")}
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
              {t("featureGrid.rideTitle")}
            </h2>
            <p className="text-secondary-app text-sm md:text-base leading-relaxed font-body">
              {t("featureGrid.rideSubtitle")}
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
                {t("featureGrid.culinaryExcellenceTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.culinaryExcellenceDesc")}
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="directions_car" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                {t("featureGrid.executiveMotionTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.executiveMotionDesc")}
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="local_shipping" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                {t("featureGrid.swiftLogisticsTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.swiftLogisticsDesc")}
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
                {t("featureGrid.airportTransfersTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.airportTransfersDesc")}
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="apartment" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                {t("featureGrid.cityCommutesTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.cityCommutesDesc")}
              </p>
            </div>

            <div className="bg-surface-soft p-8 rounded border border-surface-container hover:border-brand-kinetic/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.01)] transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center rounded mb-6">
                <Icon name="schedule" className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-primary font-display mb-3">
                {t("featureGrid.hourlyHireTitle")}
              </h3>
              <p className="text-secondary-app text-sm leading-relaxed font-body">
                {t("featureGrid.hourlyHireDesc")}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
