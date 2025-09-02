import { useEffect, useMemo, useState } from "react";
import MealHeader from "../../components/MealHeader.jsx";
import api from "../../api.js";
import toast from "react-hot-toast";
import MealCard from "../../components/MealCard.jsx";

const CATEGORY_ORDER = ["breakfast", "lunch", "dinner", "snack", "special", "other", "uncategorized"];

// Small reusable pill button
const Chip = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={[
      "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all border",
      active
        ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
        : "bg-slate-800/60 text-slate-200 border-slate-600 hover:bg-slate-700"
    ].join(" ")}
  >
    <span className="capitalize">{children}</span>
    {typeof count === "number" && <span className="opacity-70"> ({count})</span>}
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
        const payload = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? res.data?.meals ?? [];
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

  // Group by category
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

  // Tabs
  const tabs = useMemo(() => {
    const available = Object.keys(grouped);
    const ordered = CATEGORY_ORDER.filter((c) => available.includes(c));
    const leftovers = available.filter((c) => !CATEGORY_ORDER.includes(c));
    return ["all", ...ordered, ...leftovers];
  }, [grouped]);

  useEffect(() => {
    if (!tabs.includes(activeCat) && tabs.length) setActiveCat(tabs[0]);
  }, [tabs, activeCat]);

  // Apply category + search filter
  const visibleMeals = useMemo(() => {
    let list = activeCat === "all" ? meals : grouped[activeCat] ?? [];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((m) => m.name?.toLowerCase().includes(term));
    }
    return list;
  }, [meals, grouped, activeCat, search]);

  return (
    <div className="min-h-screen">
      <MealHeader />

      {/* Toolbar: Search + Categories on one line */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          {/* Search */}
          <div className="relative grow basis-[320px]">
            <input
              type="text"
              placeholder="Search meals by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-slate-800 text-slate-100 placeholder-slate-400
                         border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500
                         px-4 py-2.5"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 select-none">🔎</span>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible max-w-full">
            <Chip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              count={meals.length}
            >
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

      <div className="max-w-7xl mx-auto p-4">
        {loading && (
          <div className="text-center text-emerald-400 py-10">Loading meals...</div>
        )}

        {!loading && visibleMeals.length === 0 && (
          <div className="text-center text-slate-400 py-10">
            {search
              ? `No meals found matching "${search}".`
              : activeCat === "all"
                ? "No meals found."
                : `No meals in "${activeCat}".`}
          </div>
        )}

        {!loading && visibleMeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMeals.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaretakerMeals;
