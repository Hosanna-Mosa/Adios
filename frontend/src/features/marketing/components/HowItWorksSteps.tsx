import { useTranslation } from "react-i18next";
import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

export function HowItWorksSteps() {
  const { t } = useTranslation();
  const steps = [
    {
      step: "01",
      title: t("howItWorks.registerTitle"),
      desc: t("howItWorks.registerDesc"),
    },
    {
      step: "02",
      title: t("howItWorks.verifyTitle"),
      desc: t("howItWorks.verifyDesc"),
    },
    {
      step: "03",
      title: t("howItWorks.goLiveTitle"),
      desc: t("howItWorks.goLiveDesc"),
    },
    {
      step: "04",
      title: t("howItWorks.growTitle"),
      desc: t("howItWorks.growDesc"),
    },
  ];
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-surface-container-low/30"
    >
      <div className="container max-w-[900px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-secondary-app max-w-lg mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        <StaggerList inView className="space-y-8">
          {steps.map((step, i) => (
            <StaggerItem key={i} className="flex gap-6 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-kinetic text-white flex items-center justify-center font-display font-extrabold text-lg shrink-0">
                  {step.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-8 bg-surface-container mt-2" />
                )}
              </div>
              <div className="pt-3">
                <h3 className="font-display text-lg font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-secondary-app text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
