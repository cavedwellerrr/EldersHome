import { useEffect, useMemo, useState } from "react";
import MealHeader from "../../components/wellness/MealHeader.jsx";
import api from "../../api.js";
import toast from "react-hot-toast";
import MealCard from "../../components/wellness/MealCard.jsx";

const CATEGORY_ORDER = ["breakfast", "lunch", "dinner", "snack", "special", "other", "uncategorized"];

// Theme-matching chip
const Chip = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={[
      "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all border",
      active
        ? "bg-[#FAEEE8] text-[#B5522A] border-[#F2C7AE] shadow-sm"
        : "bg-white/70 text-neutral-700 border-neutral-200 hover:bg-neutral-50"
    ].join(" ")}
  >
    <span className="capitalize">{children}</span>
    {typeof count === "number" && <span className="opacity-60"> ({count})</span>}
  </button>
);

const CaretakerMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await api.get("/meals");
        const payload = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data?.meals ?? [];
        setMeals(Array.isArray(payload) ? payload : []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load meals");
        console.error("Error fetching meals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  // group by category & sort desc by date
  const grouped = useMemo(() => {
    const acc = meals.reduce((map, m) => {
      const cat = (m.category || "uncategorized").toLowerCase();
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
      return map;
    }, {});
    Object.keys(acc).forEach((k) => {
      acc[k].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    });
    return acc;
  }, [meals]);

  // ordered tabs
  const tabs = useMemo(() => {
    const available = Object.keys(grouped);
    const ordered = CATEGORY_ORDER.filter((c) => available.includes(c));
    const leftovers = available.filter((c) => !CATEGORY_ORDER.includes(c));
    return ["all", ...ordered, ...leftovers];
  }, [grouped]);

  useEffect(() => {
    if (!tabs.includes(activeCat) && tabs.length) setActiveCat(tabs[0]);
  }, [tabs, activeCat]);

  // filters
  const visibleMeals = useMemo(() => {
    let list = activeCat === "all" ? meals : grouped[activeCat] ?? [];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((m) => m.name?.toLowerCase().includes(term));
    }
    return list;
  }, [meals, grouped, activeCat, search]);

  // small skeleton grid
  const Skeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 bg-white/70 h-52" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF7F2] text-neutral-800">
      {/* top hero banner (matches reference tone) */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FFF2EA] via-[#FFE7DA] to-[#FFEFE6]" />
        <MealHeader />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8">
          <div className="rounded-3xl bg-white/70 backdrop-blur border border-[#F4D7C8] p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
                  Makes Your Meal Planning Simple & Caring
                </h2>
                <p className="text-neutral-600 mt-1">
                  Curated breakfasts, lunches, dinners and snacks with senior-friendly nutrition.
                </p>
              </div>

              {/* quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Meals" value={meals.length} />
                <Stat label="Categories" value={tabs.length - 1} />
                <Stat label="Today" value={new Date().toLocaleDateString()} small />
              </div>
            </div>

            {/* toolbar */}
            <div className="mt-6 flex items-center gap-3 flex-wrap md:flex-nowrap">
              {/* Search */}
              <div className="relative grow basis-[320px]">
                <input
                  type="text"
                  placeholder="Search meals by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#F29B77]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 select-none">🔎</span>
              </div>

              {/* chips */}
              <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible max-w-full">
                <Chip active={activeCat === "all"} onClick={() => setActiveCat("all")} count={meals.length}>
                  all
                </Chip>

                {tabs
                  .filter((c) => c !== "all")
                  .map((cat) => (
                    <Chip
                      key={cat}
                      active={activeCat === cat}
                      onClick={() => setActiveCat(cat)}
                      count={grouped[cat]?.length || 0}
                    >
                      {cat}
                    </Chip>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* content */}
      <div className="max-w-7xl mx-auto px-4 pb-14">
        {loading && <Skeleton />}

        {!loading && visibleMeals.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#FAEEE8] grid place-items-center">
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="mt-4 text-lg font-medium text-neutral-800">Nothing here yet</p>
            <p className="text-neutral-600">
              {search
                ? `No meals found matching “${search}”.`
                : activeCat === "all"
                  ? "No meals found."
                  : `No meals in “${activeCat}”.`}
            </p>
          </div>
        )}

        {!loading && visibleMeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMeals.map((meal) => (
              <MealCard key={meal._id} meal={meal} onUpdated={() => window.location.reload()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, small }) => (
  <div className="rounded-2xl bg-[#FFF9F6] border border-[#F4D7C8] px-4 py-3 text-center">
    <div className={`font-semibold ${small ? "text-sm" : "text-xl"} text-neutral-900`}>{value}</div>
    <div className="text-xs tracking-wide text-neutral-500">{label}</div>
  </div>
);

export default CaretakerMeals;