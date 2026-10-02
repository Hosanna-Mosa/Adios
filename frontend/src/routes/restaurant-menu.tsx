import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/lib/api-client";
import { Icon } from "@/components/shared/Icon";
import { MenuHeader } from "@/features/menu/components/MenuHeader";
import { CategoryNav } from "@/features/menu/components/CategoryNav";
import { MenuItemCard } from "@/features/menu/components/MenuItemCard";

// "General" is a stable fallback for items with no category — only its
// displayed label is translated; grouping/filtering still keys off it as-is.
function categoryDisplay(cat: string, t: (key: string) => string) {
  if (cat === "All") return t("menu.allCategories");
  if (cat === "General") return t("menu.general");
  return cat;
}

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isPureVeg: boolean;
  rating: number;
  reviews: string;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isVeg: boolean;
  images?: string[];
}

export default function RestaurantMenuFront() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const highlightedItemId = searchParams.get("item");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/food/restaurant-menu/restaurants/${id}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data.restaurant);
          setMenu(data.menu || []);
          return;
        }

        // The customer app shares a *vendor* id (app/utils/shareLink.ts), which
        // lives in a different collection from the admin-curated digital menus
        // above — so every shared dish link used to land on "Restaurant not
        // found". Both endpoints below are public, same as the one above.
        const [vendorRes, menuRes] = await Promise.all([
          fetch(`${API_BASE_URL}/vendors/${id}`),
          fetch(`${API_BASE_URL}/food/vendor/${id}`),
        ]);
        if (!vendorRes.ok) {
          throw new Error(t("menu.restaurantNotFoundError"));
        }
        const vendor = await vendorRes.json();
        setRestaurant(vendor);
        setMenu(menuRes.ok ? await menuRes.json() : []);
      } catch (err) {
        setError(
          (err as { message?: string })?.message ||
            t("menu.failedToLoadMenu"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantData();
    }
  }, [id, t]);

  // Shared via a "share this dish" link — scroll straight to it once the menu has loaded.
  useEffect(() => {
    if (loading || !highlightedItemId) return;
    const el = document.getElementById(`menu-item-${highlightedItemId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading, highlightedItemId]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-primary font-semibold text-lg"
        >
          {t("menu.loadingMenu")}
        </motion.p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Icon name="error" className="text-red-500 text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-primary">
          {t("menu.somethingWentWrong")}
        </h1>
        <p className="text-slate-500 mt-2 max-w-md">
          {error || t("menu.restaurantNotFoundDesc")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-md"
        >
          <Icon name="arrow_back" /> {t("menu.backToHome")}
        </Link>
      </div>
    );
  }

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(menu.map((item) => item.category || "General"))),
  ];

  // Filter menu items
  const filteredMenu = menu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  const groupedMenu = Object.entries(
    filteredMenu.reduce(
      (acc, item) => {
        const cat = item.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, MenuItem[]>,
    ),
  );

  return (
    <div className="bg-menu-surface min-h-[100dvh] text-menu-ink font-sans pb-24 relative selection:bg-primary selection:text-white">
      <MenuHeader restaurant={restaurant} />

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-20 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          vegOnly={vegOnly}
          setVegOnly={setVegOnly}
        />

        {/* Menu Items List - Right Side */}
        <div className="lg:col-span-3 space-y-8 md:space-y-12">
          <AnimatePresence mode="wait">
            {filteredMenu.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] space-y-4 shadow-sm"
              >
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Icon name="search_off" className="text-slate-300 text-4xl" />
                </div>
                <h3 className="text-xl font-black text-slate-700">
                  {t("menu.noDishesFound")}
                </h3>
                <p className="text-slate-400 text-sm font-medium">
                  {t("menu.tryAdjustingFilters")}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setVegOnly(false);
                    setSelectedCategory("All");
                  }}
                  className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold transition-colors"
                >
                  {t("menu.clearFilters")}
                </button>
              </motion.div>
            ) : (
              // Group and render
              groupedMenu.map(([category, items], categoryIndex) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  key={category}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="flex items-center gap-3 sticky top-[125px] md:static bg-menu-surface md:bg-transparent py-2 z-30">
                    <h3 className="text-xl md:text-2xl font-black text-primary capitalize tracking-tight">
                      {categoryDisplay(category, t)}
                    </h3>
                    <div className="h-px bg-slate-200 flex-1 hidden md:block" />
                    <span className="text-xs font-black bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full shadow-sm">
                      {t("menu.itemCount", { count: items.length, defaultValue: "{{count}} items" })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {items.map((item, idx) => (
                      <MenuItemCard
                        key={item._id || idx}
                        item={item}
                        idx={idx}
                        highlightedItemId={highlightedItemId}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
