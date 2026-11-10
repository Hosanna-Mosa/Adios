import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hero } from "@/features/marketing/components/Hero";
import { ServiceCards } from "@/features/marketing/components/ServiceCards";
import { HelperSection } from "@/features/marketing/components/HelperSection";
import { CollectionsCarousel } from "@/features/marketing/components/CollectionsCarousel";
import { HowAdiosWorks } from "@/features/marketing/components/HowAdiosWorks";
import { EarnWithAdios } from "@/features/marketing/components/EarnWithAdios";
import { PartnerHero } from "@/features/marketing/components/PartnerHero";
import { BenefitsGrid } from "@/features/marketing/components/BenefitsGrid";
import { HowItWorksSteps } from "@/features/marketing/components/HowItWorksSteps";
import { FaqAccordion } from "@/features/marketing/components/FaqAccordion";
import { PartnerCtaSection } from "@/features/marketing/components/PartnerCtaSection";
import { AppDownloadBand } from "@/features/marketing/components/AppDownloadBand";
import { PartnerTypeCards } from "@/features/marketing/components/PartnerTypeCards";

/**
 * The whole public site on one page: customer sections first, then the
 * partner pitch (formerly /partner), FAQ and the app download band.
 */
export default function Home() {
  const [showPartnerTypeDialog, setShowPartnerTypeDialog] = useState(false);
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Arriving from another route with a hash (e.g. /#partner from onboarding's
  // back link or the /partner redirect): scroll once the sections exist.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [hash]);

  const openPartnerDialog = () => setShowPartnerTypeDialog(true);
  const startOnboarding = (type: "food" | "meat") => {
    setShowPartnerTypeDialog(false);
    navigate(`/partner/onboarding?type=${type}`);
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-background text-on-surface">
      <Hero />
      <ServiceCards />
      <HelperSection />
      <CollectionsCarousel />
      <HowAdiosWorks />
      <EarnWithAdios />

      {/* Partner with Adios */}
      <PartnerHero onGetStarted={openPartnerDialog} />
      <BenefitsGrid />
      <HowItWorksSteps />
      <FaqAccordion />
      <PartnerCtaSection onGetStarted={openPartnerDialog} />

      <AppDownloadBand />

      <PartnerTypeCards
        open={showPartnerTypeDialog}
        onClose={() => setShowPartnerTypeDialog(false)}
        onSelect={startOnboarding}
      />
    </main>
  );
}
