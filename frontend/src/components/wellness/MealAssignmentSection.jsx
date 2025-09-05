// src/components/staff/MealAssignmentSection.jsx
import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
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

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="border border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center justify-between w-full">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                        <Utensils className="w-5 h-5 text-orange-500" />
                        Meal Preferences
                    </h4>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button
                                className="btn btn-primary btn-sm bg-orange-500 hover:bg-orange-600 border-orange-500"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Preferences
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-success btn-sm bg-green-600 hover:bg-green-700"
                                    onClick={save}
                                >
                                    Save Changes
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={cancel}>
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Meal Categories */}
            <div className="grid gap-4 md:grid-cols-2">
                {categories.map((cat) => {
                    const list = optionsByCat[cat] || [];
                    const key = catKey(cat);
                    const selectedIds = new Set(prefs.selections[key] || []);
                    const chips = namesFor(cat);

                    return (
                        <div key={cat} className="bg-white rounded-lg shadow-lg">
                            <div className="bg-gray-50 p-4 rounded-t-lg border-b">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-semibold flex items-center gap-2 text-gray-900">
                                        <span className="text-lg">{categoryIcons[cat] || "🍽️"}</span>
                                        {cat}
                                    </h5>
                                    {!isEditing && chips.length === 0 && (
                                        <button
                                            className="btn btn-ghost btn-xs text-orange-500 hover:text-orange-600"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Add Items
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                {!isEditing && (
                                    <div className="min-h-[60px] flex items-center">
                                        {chips.length ? (
                                            <div className="flex flex-wrap gap-2">
                                                {chips.map((m) => (
                                                    <div
                                                        key={m._id}
                                                        className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                                                    >
                                                        {m.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center w-full py-4">
                                                <Utensils className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    No meals selected for {cat.toLowerCase()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="space-y-3">
                                        <div className="text-xs text-orange-600 font-medium uppercase tracking-wider">
                                            Select {cat} Options
                                        </div>
                                        <div className="max-h-48 overflow-auto bg-gray-50 rounded-lg p-3">
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
                                                            className="flex items-center gap-3 bg-white rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm"
                                                                checked={selectedIds.has(m._id)}
                                                                onChange={() => toggleMeal(cat, m._id)}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm text-gray-900">{m.name}</div>
                                                                <div className="text-xs text-gray-600">{m.category}</div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="bg-white rounded-lg p-4 text-center">
                    <span className="loading loading-spinner loading-md text-orange-500"></span>
                    <p className="text-gray-600 mt-2">Loading meals...</p>
                </div>
            )}
        </div>
    );
}
