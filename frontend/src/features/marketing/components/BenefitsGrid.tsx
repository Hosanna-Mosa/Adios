import { Icon } from "../../../components/shared/Icon";
import { StaggerList } from "../../../components/motion/StaggerList";
import { StaggerItem } from "../../../components/motion/StaggerItem";

const benefits = [
  {
    icon: "trending_up",
    title: "Boost Your Revenue",
    desc: "Join 500K+ partners and tap into a city-wide customer base hungry for your offerings.",
  },
  {
    icon: "insights",
    title: "Real-Time Analytics",
    desc: "Get powerful insights on orders, peak hours, and customer preferences to grow your business.",
  },
  {
    icon: "rocket_launch",
    title: "Fast Onboarding",
    desc: "Go from sign-up to live in under 48 hours with our dedicated partner support team.",
  },
  {
    icon: "local_shipping",
    title: "Delivery Infrastructure",
    desc: "Leverage our fleet of verified drivers to deliver faster and farther than ever before.",
  },
];

export function BenefitsGrid() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Partner with Hybrid?
          </h2>
          <p className="text-secondary-app max-w-lg mx-auto">
            Everything you need to grow your business and delight your
            customers.
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
