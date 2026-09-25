import { useTranslation } from "react-i18next";
import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

export function PartnerStats() {
  const { t } = useTranslation();
  return (
    <section className="py-12 bg-surface-container-low/30 border-b border-surface-container">
      <StaggerList inView className="container max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["500K+", t("partnerStats.registeredPartners")],
            ["120+", t("partnerStats.citiesCovered")],
            ["50M+", t("partnerStats.ordersProcessed")],
            ["4.8★", t("partnerStats.partnerRating")],
          ].map(([value, label]) => (
            <StaggerItem key={label}>
              <p className="font-display text-3xl lg:text-4xl font-extrabold text-brand-kinetic">
                {value}
              </p>
              <p className="text-sm text-secondary-app font-medium mt-1">
                {label}
              </p>
            </StaggerItem>
          ))}
        </div>
      </StaggerList>
    </section>
  );
}
