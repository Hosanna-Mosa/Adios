import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../components/shared/Icon";
import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

export function FaqAccordion() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: t("faq.documentsQ"), a: t("faq.documentsA") },
    { q: t("faq.onboardingTimeQ"), a: t("faq.onboardingTimeA") },
    { q: t("faq.commissionQ"), a: t("faq.commissionA") },
    { q: t("faq.multiServiceQ"), a: t("faq.multiServiceA") },
    { q: t("faq.commitmentQ"), a: t("faq.commitmentA") },
  ];

  return (
    <section className="py-20 lg:py-28 bg-surface-container-low/30">
      <div className="container max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-secondary-app max-w-md mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>
        <StaggerList inView className="space-y-3">
          {faqs.map((faq, i) => (
            <StaggerItem
              key={i}
              className="rounded-2xl border border-surface-container bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold hover:bg-surface-container-low/50 transition-colors"
              >
                <span>{faq.q}</span>
                <Icon
                  name={openFaq === i ? "remove" : "add"}
                  className={`text-xl transition-all duration-300 ${openFaq === i ? "text-brand-kinetic" : "text-secondary-app"}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-sm text-secondary-app leading-relaxed border-t border-surface-container pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
