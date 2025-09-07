// src/components/staff/MealAssignmentSection.jsx
import { useEffect, useState } from "react";
import { Utensils, Search, Filter, Plus, Check } from "lucide-react";
import api from "../../api";

export default function MealAssignmentSection({ elderId }) {
    const token = localStorage.getItem("staffToken");

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(["Breakfast", "Lunch", "Dinner", "Snack"]);
    const [optionsByCat, setOptionsByCat] = useState({});
    const [prefs, setPrefs] = useState({
        allergies: [],
        notes: "",
        selections: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    });
    const [displayByKey, setDisplayByKey] = useState({
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
    });

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showSearchResults, setShowSearchResults] = useState(false);

    const catKey = (c) => (c.toLowerCase() === "snack" ? "snacks" : c.toLowerCase());

    const load = async () => {
        setLoading(true);
        try {
            // categories (filter out "Other")
            const cRes = await api.get(`/assign/meals/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const cats = (cRes.data?.categories || categories).filter(
                (c) => c.toLowerCase() !== "other"
            );
            setCategories(cats);

            // meals per category
            const byCat = {};
            for (const c of cats) {
                const res = await api.get(`/assign/meals/options?category=${encodeURIComponent(c)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                byCat[c] = res.data?.meals || [];
            }
            setOptionsByCat(byCat);

            // current preferences
            const pRes = await api.get(`/assign/meals/${elderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const pref = pRes.data?.preference;

            if (pref) {
                setPrefs({
                    allergies: pref.allergies || [],
                    notes: pref.notes || "",
                    selections: {
                        breakfast: (pref.selections?.breakfast || []).map((m) => m._id || m),
                        lunch: (pref.selections?.lunch || []).map((m) => m._id || m),
                        dinner: (pref.selections?.dinner || []).map((m) => m._id || m),
                        snacks: (pref.selections?.snacks || []).map((m) => m._id || m),
                    },
                });

                setDisplayByKey({
                    breakfast: (pref.selections?.breakfast || []).map((m) => ({
                        _id: m._id || m,
                        name: m.name || "",
                        category: "Breakfast",
                    })),
                    lunch: (pref.selections?.lunch || []).map((m) => ({
                        _id: m._id || m,
                        name: m.name || "",
                        category: "Lunch",
                    })),
                    dinner: (pref.selections?.dinner || []).map((m) => ({
                        _id: m._id || m,
                        name: m.name || "",
                        category: "Dinner",
                    })),
                    snacks: (pref.selections?.snacks || []).map((m) => ({
                        _id: m._id || m,
                        name: m.name || "",
                        category: "Snack",
                    })),
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [elderId]);

    const namesFor = (cat) => {
        const key = catKey(cat);
        const ids = new Set(prefs.selections[key] || []);
        const opts = optionsByCat[cat] || [];
        const found = opts
            .filter((m) => ids.has(m._id))
            .map((m) => ({ _id: m._id, name: m.name, category: cat }));
        const existing = new Map(found.map((m) => [m._id, m]));
        (displayByKey[key] || []).forEach((m) => {
            if (!existing.has(m._id) && ids.has(m._id)) existing.set(m._id, m);
        });
        return Array.from(existing.values());
    };

    const toggleMeal = (cat, mealId) => {
        const key = catKey(cat);
        setPrefs((p) => {
            const set = new Set(p.selections[key] || []);
            if (set.has(mealId)) set.delete(mealId);
            else set.add(mealId);
            return { ...p, selections: { ...p.selections, [key]: Array.from(set) } };
        });
    };

    const save = async () => {
        try {
            await api.put(`/assign/meals/${elderId}`, prefs, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsEditing(false);
            load();
        } catch (e) {
            alert(e?.response?.data?.message || e.message || "Failed to save preferences");
        }
    };

    const cancel = () => {
        setIsEditing(false);
        load();
    };

    const categoryIcons = {
        Breakfast: "🌅",
        Lunch: "☀️",
        Dinner: "🌙",
        Snack: "🍪",
    };

    // Search functionality
    const getAllMeals = () => {
        const allMeals = [];
        Object.entries(optionsByCat).forEach(([category, meals]) => {
            meals.forEach(meal => {
                allMeals.push({ ...meal, category });
            });
        });
        return allMeals;
    };

    const getFilteredMeals = () => {
        const allMeals = getAllMeals();
        let filtered = allMeals;

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(meal =>
                meal.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(meal => meal.category === selectedCategory);
        }

        return filtered;
    };

    const handleSearch = () => {
        if (searchTerm.trim() || selectedCategory !== "All") {
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setShowSearchResults(false);
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white rounded-lg shadow-lg border border-orange-100" style={{ boxShadow: '0 -4px 8px -2px rgba(0, 0, 0, 0.08), 0 -2px 4px -1px rgba(0, 0, 0, 0.04), 0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)' }}>
                <div className="bg-white p-4 border-b border-orange-200">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Utensils className="w-4 h-4 text-orange-600" />
                            </div>
                            Meal Management
                        </h4>
                        <div className="flex gap-2">
                            {!isEditing && (
                                <button
                                    className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Plus className="w-4 h-4" />
                                    Edit Preferences
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {/* Current Assignments Summary */}
            {!isEditing && (
                <div className="bg-white rounded-lg shadow-lg border border-orange-100" style={{ boxShadow: '0 -4px 8px -2px rgba(0, 0, 0, 0.08), 0 -2px 4px -1px rgba(0, 0, 0, 0.04), 0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)' }}>
                    <div className="bg-white p-4 border-b border-orange-200">
                        <h5 className="font-semibold flex items-center gap-2 text-gray-900">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-orange-600" />
                            </div>
                            Current Meal Assignments
                        </h5>
                    </div>
                    <div className="p-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {categories.map((cat) => {
                                const chips = namesFor(cat);
                                return (
                                    <div key={cat} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{categoryIcons[cat] || "🍽️"}</span>
                                            <span className="font-medium text-sm text-gray-900">{cat}</span>
                                            <span className="text-xs text-orange-600 font-semibold">({chips.length})</span>
                                        </div>
                                        {chips.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {chips.slice(0, 3).map((m) => (
                                                    <span
                                                        key={m._id}
                                                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium border border-orange-200"
                                                    >
                                                        {m.name}
                                                    </span>
                                                ))}
                                                {chips.length > 3 && (
                                                    <span className="px-2 py-1 bg-white text-gray-600 rounded-full text-xs border border-gray-200">
                                                        +{chips.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500">No meals assigned</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Meal Categories - Only show when editing */}
            {isEditing && (
                <div className="bg-white rounded-lg shadow-lg border border-orange-100" style={{ boxShadow: '0 -4px 8px -2px rgba(0, 0, 0, 0.08), 0 -2px 4px -1px rgba(0, 0, 0, 0.04), 0 4px 8px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)' }}>
                    <div className="bg-white p-4 border-b border-orange-200">
                        <h5 className="font-semibold flex items-center gap-2 text-gray-900">
                            <Utensils className="w-4 h-4 text-orange-600" />
                            Detailed Meal Selection by Category
                        </h5>
                    </div>

                    {/* Search Section */}
                    <div className="p-4 border-b border-orange-200">
                        <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border border-orange-200">
                            <h6 className="font-semibold flex items-center gap-2 text-gray-900 mb-3">
                                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Search className="w-3 h-3 text-orange-600" />
                                </div>
                                Search & Filter Meals
                            </h6>

                            {/* Search Bar */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
                                        <input
                                            type="text"
                                            placeholder="Search meals by name..."
                                            className="input input-bordered w-full pl-10 pr-4 bg-white border-orange-200 focus:border-orange-400"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <div className="sm:w-48">
                                    <select
                                        className="select select-bordered w-full bg-white border-orange-200 focus:border-orange-400"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="All">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-outline btn-sm border-orange-300 text-orange-600 hover:bg-orange-50"
                                        onClick={handleSearch}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Search
                                    </button>
                                    {(searchTerm || selectedCategory !== "All") && (
                                        <button
                                            className="btn btn-ghost btn-sm text-gray-600 hover:text-gray-800"
                                            onClick={clearSearch}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Results */}
                    {showSearchResults && (
                        <div className="p-4">
                            <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border border-orange-200 mb-4">
                                <h6 className="font-semibold flex items-center gap-2 text-gray-900">
                                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Search className="w-3 h-3 text-orange-600" />
                                    </div>
                                    Search Results ({getFilteredMeals().length} meals found)
                                </h6>
                            </div>

                            {getFilteredMeals().length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {getFilteredMeals().map((meal) => {
                                        const key = catKey(meal.category);
                                        const isSelected = prefs.selections[key]?.includes(meal._id) || false;

                                        return (
                                            <div
                                                key={meal._id}
                                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${isSelected
                                                    ? 'border-orange-300 bg-orange-50'
                                                    : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-25'
                                                    }`}
                                                onClick={() => toggleMeal(meal.category, meal._id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm text-gray-900">{meal.name}</div>
                                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                                            <span className="text-lg">{categoryIcons[meal.category] || "🍽️"}</span>
                                                            {meal.category}
                                                        </div>
                                                    </div>
                                                    <div className="ml-2">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm"
                                                            checked={isSelected}
                                                            onChange={() => toggleMeal(meal.category, meal._id)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No meals found matching your search criteria.</p>
                                    <button
                                        className="btn btn-ghost btn-sm mt-2 text-orange-600 hover:text-orange-700"
                                        onClick={clearSearch}
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Category Selection */}
                    {!showSearchResults && (
                        <div className="p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {categories.map((cat) => {
                                    const list = optionsByCat[cat] || [];
                                    const key = catKey(cat);
                                    const selectedIds = new Set(prefs.selections[key] || []);

                                    return (
                                        <div key={cat} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-lg">{categoryIcons[cat] || "🍽️"}</span>
                                                <h6 className="font-semibold text-gray-900">{cat}</h6>
                                                <span className="text-xs text-gray-500">({selectedIds.size} selected)</span>
                                            </div>

                                            <div className="max-h-48 overflow-auto bg-white rounded-lg p-3 border border-gray-200">
                                                {list.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm text-gray-600">
                                                            No meals available in this category
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {list.map((m) => (
                                                            <label
                                                                key={m._id}
                                                                className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors cursor-pointer rounded"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary checkbox-sm"
                                                                    checked={selectedIds.has(m._id)}
                                                                    onChange={() => toggleMeal(cat, m._id)}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm text-gray-900">{m.name}</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Save/Cancel buttons at the bottom */}
                    <div className="p-4 bg-orange-50 border-t border-orange-200">
                        <div className="flex justify-end gap-2">
                            <button
                                className="bg-green-500 text-white hover:bg-green-600 border-2 border-green-500 hover:border-green-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                onClick={save}
                            >
                                <Check className="w-4 h-4" />
                                Save Changes
                            </button>
                            <button
                                className="bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                                onClick={cancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-lg shadow-lg border border-orange-100 p-4 text-center">
                    <span className="loading loading-spinner loading-md text-orange-500"></span>
                    <p className="text-gray-600 mt-2">Loading meals...</p>
                </div>
            )}
        </div>
    );
}