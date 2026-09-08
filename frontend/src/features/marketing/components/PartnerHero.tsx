import { Icon } from "../../../components/shared/Icon";
import { FadeIn } from "../../../components/motion/FadeIn";

type Props = { onGetStarted: () => void };

export function PartnerHero({ onGetStarted }: Props) {
  return (
    <section className="relative pt-24 pb-20 lg:pb-28 bg-gradient-to-br from-on-surface via-navy-mid to-navy-light overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-kinetic rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-kinetic/50 rounded-full blur-3xl" />
      </div>
      <FadeIn className="container max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-kinetic/10 text-brand-kinetic rounded-full mb-8 text-sm font-semibold border border-brand-kinetic/20">
            <Icon name="handshake" className="text-lg" />
            Partner with Hybrid
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 tracking-tight text-white font-extrabold">
            Grow Your Business with{" "}
            <span className="text-brand-kinetic">Hybrid</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            Join India's fastest-growing urban platform. Whether you run a
            restaurant, a fleet, or a service — we help you reach more customers
            and earn more.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="bg-brand-kinetic text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-brand-kinetic/20 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started Today
            </button>
            <a
              href="#how-it-works"
              className="bg-white/10 backdrop-blur-md text-white px-8 py-3.5 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
