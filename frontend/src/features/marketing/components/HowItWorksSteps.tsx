import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

const steps = [
  {
    step: "01",
    title: "Register Your Business",
    desc: "Fill out a quick form with your business details, location, and service type.",
  },
  {
    step: "02",
    title: "Verify & Setup",
    desc: "Our team verifies your documents and helps you set up your menu or service listings.",
  },
  {
    step: "03",
    title: "Go Live",
    desc: "Start receiving orders and ride requests within 48 hours. Track everything in real time.",
  },
  {
    step: "04",
    title: "Grow & Earn",
    desc: "Access analytics, promotional tools, and dedicated support to scale your business.",
  },
];

export function HowItWorksSteps() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-surface-container-low/30"
    >
      <div className="container max-w-[900px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-secondary-app max-w-lg mx-auto">
            Get your business on Hybrid in four simple steps.
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
