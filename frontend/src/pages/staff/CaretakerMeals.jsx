import { useEffect, useMemo, useState } from "react";
import MealHeader from "../../components/wellness/MealHeader.jsx";
import api from "../../api.js";
import toast from "react-hot-toast";
import MealCard from "../../components/wellness/MealCard.jsx";

const CATEGORY_ORDER = ["breakfast", "lunch", "dinner", "snack", "special", "other", "uncategorized"];

// Theme-matching chip with AssignedElders styling
const Chip = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={[
      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border-2",
      active
        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
        : "bg-white text-gray-700 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
    ].join(" ")}
  >
    <span className="capitalize">{children}</span>
    {typeof count === "number" && <span className="opacity-80 ml-1">({count})</span>}
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

  // Enhanced skeleton grid matching AssignedElders theme
  const Skeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="text-gray-600 font-medium">Loading meals...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Meal Management
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <p className="text-gray-600 font-medium">
                    {meals.length ? `${meals.length} meals available` : "Loading..."}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Meals" value={meals.length} />
                <Stat label="Categories" value={tabs.length - 1} />
                <Stat label="Today" value={new Date().toLocaleDateString()} small />
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search meals by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto lg:overflow-visible">
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

        {/* Add Meal Button */}
        <MealHeader />

        {/* Loading State */}
        {loading && <Skeleton />}

        {/* No Results State */}
        {!loading && visibleMeals.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meals found</h3>
                <p className="text-gray-600">
                  {search
                    ? `No results match "${search}"`
                    : activeCat === "all"
                      ? "No meals available yet."
                      : `No meals in "${activeCat}" category.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meals Grid */}
        {!loading && visibleMeals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMeals.map((meal) => (
                  <MealCard key={meal._id} meal={meal} onUpdated={() => window.location.reload()} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-orange-100">
              <p className="text-sm text-gray-600 flex items-center justify-between">
                <span>Showing {visibleMeals.length} of {meals.length} meals</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Meal management system</span>
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, small }) => (
  <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-200 px-4 py-3 text-center shadow-sm">
    <div className={`font-bold ${small ? "text-sm" : "text-xl"} text-gray-900`}>{value}</div>
    <div className="text-xs font-medium tracking-wide text-gray-600">{label}</div>
  </div>
);

export default CaretakerMeals;