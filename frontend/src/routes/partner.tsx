import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartnerHero } from "@/features/marketing/components/PartnerHero";
import { PartnerStats } from "@/features/marketing/components/PartnerStats";
import { BenefitsGrid } from "@/features/marketing/components/BenefitsGrid";
import { HowItWorksSteps } from "@/features/marketing/components/HowItWorksSteps";
import { FaqAccordion } from "@/features/marketing/components/FaqAccordion";
import { PartnerCtaSection } from "@/features/marketing/components/PartnerCtaSection";
import { PartnerTypeCards } from "@/features/marketing/components/PartnerTypeCards";

export default function PartnerPage() {
  const [showPartnerTypeDialog, setShowPartnerTypeDialog] = useState(false);
  const navigate = useNavigate();

  const startOnboarding = (type: "food" | "meat") => {
    setShowPartnerTypeDialog(false);
    navigate(`/partner/onboarding?type=${type}`);
  };

  return (
    <div className="bg-white text-on-surface overflow-x-hidden">
      <main>
        {/* Hero Banner */}
        <PartnerHero onGetStarted={() => setShowPartnerTypeDialog(true)} />

        {/* Stats Bar */}
        <PartnerStats />

        {/* Why Partner */}
        <BenefitsGrid />

        {/* How It Works */}
        <HowItWorksSteps />

        {/* FAQ */}
        <FaqAccordion />

        {/* CTA */}
        <PartnerCtaSection onGetStarted={() => setShowPartnerTypeDialog(true)} />
      </main>

      <PartnerTypeCards
        open={showPartnerTypeDialog}
        onClose={() => setShowPartnerTypeDialog(false)}
        onSelect={startOnboarding}
      />

    </div>
  );
}
