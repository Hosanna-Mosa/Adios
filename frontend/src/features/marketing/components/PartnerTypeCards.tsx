import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../components/shared/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "food" | "meat") => void;
};

export function PartnerTypeCards({ open, onClose, onSelect }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-kinetic">
                  Start onboarding
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-on-surface">
                  Choose your partner type
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-secondary-app transition-colors hover:text-on-surface"
                aria-label="Close"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelect("food")}
                className="group rounded-xl border border-gray-200 p-5 text-left transition-all hover:border-brand-kinetic hover:bg-brand-kinetic/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-kinetic/10 text-brand-kinetic transition-colors group-hover:bg-brand-kinetic group-hover:text-white">
                  <Icon name="restaurant" className="text-2xl" />
                </div>
                <p className="font-display text-lg font-bold text-on-surface">
                  Food Restaurant
                </p>
                <p className="mt-2 text-sm text-secondary-app">
                  Restaurant details, menu, food license, and payout setup.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelect("meat")}
                className="group rounded-xl border border-gray-200 p-5 text-left transition-all hover:border-brand-kinetic hover:bg-brand-kinetic/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-kinetic/10 text-brand-kinetic transition-colors group-hover:bg-brand-kinetic group-hover:text-white">
                  <Icon name="set_meal" className="text-2xl" />
                </div>
                <p className="font-display text-lg font-bold text-on-surface">
                  Meat Center
                </p>
                <p className="mt-2 text-sm text-secondary-app">
                  Meat center details, product list, FSSAI, and payout setup.
                </p>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
