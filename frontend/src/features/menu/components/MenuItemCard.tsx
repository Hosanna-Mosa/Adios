import { motion } from "framer-motion";
import { LazyImage } from "../../../components/shared/LazyImage";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isVeg: boolean;
  images?: string[];
}

type Props = {
  item: MenuItem;
  idx: number;
  highlightedItemId: string | null;
};

export function MenuItemCard({ item, idx, highlightedItemId }: Props) {
  return (
    <motion.div
      id={`menu-item-${item._id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      className={`bg-white border-2 rounded-[1.5rem] p-3 md:p-4 flex justify-between gap-3 md:gap-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.15)] transition-all duration-300 group ${
        item._id === highlightedItemId ? "border-menu-highlight ring-4 ring-menu-highlight/15" : "border-transparent hover:border-slate-100"
      }`}
    >
      <div className="space-y-1.5 flex-1 py-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-2 mb-1.5">
            <div className={`mt-1 h-3.5 w-3.5 rounded-sm border-[1.5px] shrink-0 flex items-center justify-center ${
              item.isVeg ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            <h4 className="font-bold text-slate-800 text-base md:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h4>
          </div>
          <span className="text-base md:text-lg font-black text-primary block pb-1">₹{item.price}</span>
        </div>

        {item.description && (
          <p className="text-[11px] md:text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 relative w-28 md:w-32">
        {item.images && item.images.length > 0 && (
          <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-100 rounded-2xl overflow-hidden shadow-inner relative">
            <LazyImage src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" wrapperClassName="w-full h-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
