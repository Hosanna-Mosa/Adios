import { useState } from "react";
import { Link } from "react-router-dom";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Hero } from "@/features/marketing/components/Hero";
import { FeatureGrid } from "@/features/marketing/components/FeatureGrid";
import { ExperienceShowcase } from "@/features/marketing/components/ExperienceShowcase";
import { CtaBand } from "@/features/marketing/components/CtaBand";

export default function Home() {
  const [activeMode, setActiveMode] = useState<"food" | "ride">("food");

  return (
    <div className="bg-surface-soft text-on-surface min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      {/* Hero Section */}
      <Hero activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* Grid Features Section */}
      <FeatureGrid activeMode={activeMode} />

      <ExperienceShowcase activeMode={activeMode} />

      {/* CTA Section */}
      <CtaBand activeMode={activeMode} />

    </div>
  );
}
