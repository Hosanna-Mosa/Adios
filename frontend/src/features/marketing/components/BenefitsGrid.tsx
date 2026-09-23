import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

export function BenefitsGrid() {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: "trending_up",
      title: t("benefitsGrid.boostRevenueTitle"),
      desc: t("benefitsGrid.boostRevenueDesc"),
    },
    {
      icon: "insights",
      title: t("benefitsGrid.realTimeAnalyticsTitle"),
      desc: t("benefitsGrid.realTimeAnalyticsDesc"),
    },
    {
      icon: "rocket_launch",
      title: t("benefitsGrid.fastOnboardingTitle"),
      desc: t("benefitsGrid.fastOnboardingDesc"),
    },
    {
      icon: "local_shipping",
      title: t("benefitsGrid.deliveryInfrastructureTitle"),
      desc: t("benefitsGrid.deliveryInfrastructureDesc"),
    },
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="container max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("benefitsGrid.title")}
          </h2>
          <p className="text-secondary-app max-w-lg mx-auto">
            {t("benefitsGrid.subtitle")}
          </p>
        </div>
        <StaggerList
          inView
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {benefits.map((benefit) => (
            <StaggerItem
              key={benefit.title}
              className="group p-8 rounded-2xl border border-surface-container bg-white hover:border-brand-kinetic/20 hover:shadow-lg hover:shadow-brand-kinetic/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-kinetic/10 flex items-center justify-center mb-6 group-hover:bg-brand-kinetic group-hover:text-white transition-all duration-300">
                <Icon
                  name={benefit.icon}
                  className="text-2xl text-brand-kinetic group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="font-display text-lg font-bold mb-3">
                {benefit.title}
              </h3>
              <p className="text-sm text-secondary-app leading-relaxed">
                {benefit.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
