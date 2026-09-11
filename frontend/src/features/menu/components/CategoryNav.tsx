import { motion } from "framer-motion";
import { Icon } from "../../../components/shared/Icon";

type Props = {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  vegOnly: boolean;
  setVegOnly: (vegOnly: boolean) => void;
};

export function CategoryNav({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  vegOnly,
  setVegOnly,
}: Props) {
  return (
    <>
      {/* Mobile-Only Horizontal Category & Filters Nav */}
      <div className="lg:hidden sticky top-[53px] z-40 bg-menu-surface pt-2 pb-3 -mx-4 px-4 space-y-3">
        {/* Mobile Search & Veg Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-slate-100">
            <Icon name="search" className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:font-normal"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-xl transition-all shadow-sm ${vegOnly ? "bg-green-100 border-green-200 text-green-700" : "bg-white border-slate-100 text-slate-400"}`}
          >
            <div
              className={`h-4 w-4 rounded-sm border-2 flex items-center justify-center ${vegOnly ? "border-green-600" : "border-slate-400"}`}
            >
              <div
                className={`h-2 w-2 rounded-full ${vegOnly ? "bg-green-600" : "bg-transparent"}`}
              />
            </div>
          </button>
        </motion.div>

        {/* Horizontally Scrollable Categories */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide snap-x">
          {categories.map((cat, idx) => (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Filters */}
      <div className="hidden lg:block lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 sticky top-28">
          <h2 className="font-black text-xl text-primary flex items-center gap-2">
            <Icon name="tune" /> Filter
          </h2>

          {/* Search */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-2 border-slate-100 focus-within:border-primary p-3 rounded-2xl bg-slate-50 transition-colors">
              <Icon name="search" className="text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search your craving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          {/* Veg Switch */}
          <div
            onClick={() => setVegOnly(!vegOnly)}
            className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-sm border-2 border-green-600 flex items-center justify-center bg-green-50">
                <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">Veg Only</span>
            </div>
            <div
              className={`w-10 h-6 rounded-full p-1 transition-colors ${vegOnly ? "bg-green-500" : "bg-slate-200"}`}
            >
              <motion.div
                layout
                className={`bg-white w-4 h-4 rounded-full shadow-sm ${vegOnly ? "ml-auto" : "mr-auto"}`}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Categories list */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-300 uppercase tracking-widest block">
              Categories
            </label>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && (
                    <Icon name="check" className="text-base" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
