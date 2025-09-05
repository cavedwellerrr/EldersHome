import React, { useEffect, useMemo, useState } from "react";
import { fetchMealsCatalog, saveMealPreferences } from "../../api/caretakerApi";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snacks"];

const Chip = ({ selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${selected
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "bg-white text-slate-700 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
            }`}
    >
        {children}
    </button>
);

const MealPreferences = ({ elder, disabled }) => {
    const elderId = elder?._id;
    const [catalog, setCatalog] = useState([]);
    const [activeCat, setActiveCat] = useState("breakfast");
    const [search, setSearch] = useState("");

    const [allergies, setAllergies] = useState(elder?.mealPreference?.allergies || []);
    const [notes, setNotes] = useState(elder?.mealPreference?.notes || "");

    const [selections, setSelections] = useState(
        elder?.mealPreference?.selections || { breakfast: [], lunch: [], dinner: [], snacks: [] }
    );

    useEffect(() => {
        (async () => setCatalog(await fetchMealsCatalog()))();
    }, []);

    useEffect(() => {
        setAllergies(elder?.mealPreference?.allergies || []);
        setNotes(elder?.mealPreference?.notes || "");
        setSelections(elder?.mealPreference?.selections || { breakfast: [], lunch: [], dinner: [], snacks: [] });
    }, [elder?._id]);

    const filtered = useMemo(() => {
        return catalog.filter(
            m =>
                m.category === activeCat &&
                m.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [catalog, activeCat, search]);

    const toggleMeal = (id) => {
        setSelections((prev) => {
            const set = new Set(prev[activeCat]);
            if (set.has(id)) set.delete(id);
            else set.add(id);
            return { ...prev, [activeCat]: Array.from(set) };
        });
    };

    const addAllergy = (a) => {
        if (!a) return;
        setAllergies((prev) => Array.from(new Set([...prev, a.trim()])));
    };

    const removeAllergy = (a) => setAllergies((prev) => prev.filter(x => x !== a));

    const handleSave = async () => {
        const payload = { allergies, notes, selections };
        const res = await saveMealPreferences(elderId, payload);
        alert(res?.message || "Saved");
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-white text-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Meal Preferences
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                            <Chip key={c} selected={activeCat === c} onClick={() => setActiveCat(c)}>
                                {c[0].toUpperCase() + c.slice(1)}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Allergies & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                        <div className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Allergies
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input
                                disabled={disabled}
                                className="border-2 border-orange-200 rounded-xl px-4 py-3 w-full focus:border-orange-400 focus:ring-0 bg-white"
                                placeholder="Add an allergy (e.g., Peanuts)"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addAllergy(e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                            <button
                                disabled
                                className="px-4 py-3 rounded-xl border-2 border-orange-200 text-orange-600 bg-white hover:bg-orange-50 transition-colors"
                                title="Press Enter to add"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allergies.map((a) => (
                                <span
                                    key={a}
                                    className="px-3 py-2 rounded-full border-2 border-red-200 bg-red-50 text-red-700 text-sm cursor-pointer hover:bg-red-100 transition-colors font-medium flex items-center gap-1"
                                    title="Click to remove"
                                    onClick={() => removeAllergy(a)}
                                >
                                    {a}
                                    <span className="text-red-500">✕</span>
                                </span>
                            ))}
                            {allergies.length === 0 && (
                                <span className="text-slate-500 italic">No allergies specified</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                        <div className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Notes
                        </div>
                        <textarea
                            disabled={disabled}
                            rows={4}
                            className="border-2 border-blue-200 rounded-xl px-4 py-3 w-full focus:border-blue-400 focus:ring-0 bg-white resize-none"
                            placeholder="Additional notes (e.g., low-salt diet, texture preferences)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Catalog & Selections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Available {activeCat}
                            </div>
                            <input
                                disabled={disabled}
                                className="border-2 border-orange-200 rounded-xl px-4 py-2 w-48 focus:border-orange-400 focus:ring-0 bg-white"
                                placeholder="Search meals…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="bg-white border-2 border-orange-200 rounded-xl max-h-64 overflow-auto shadow-sm">
                            {filtered.map((m) => {
                                const selected = selections[activeCat]?.includes(m._id);
                                return (
                                    <label key={m._id} className="flex items-center gap-3 p-4 border-b border-orange-100 last:border-0 cursor-pointer hover:bg-orange-25 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleMeal(m._id)}
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                        />
                                        <span className="text-slate-700 font-medium group-hover:text-orange-600 transition-colors">{m.name}</span>
                                    </label>
                                );
                            })}
                            {filtered.length === 0 && (
                                <div className="p-6 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No meals found</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selected Meals
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 min-h-64 max-h-64 overflow-auto">
                            {CATEGORIES.map((c) => (
                                <div key={c} className="mb-4 last:mb-0">
                                    <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        {c[0].toUpperCase() + c.slice(1)}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selections[c]?.length
                                            ? selections[c].map((id) => {
                                                const item = (catalog || []).find(mm => mm._id === id);
                                                return (
                                                    <span key={id} className="px-3 py-1 rounded-full border-2 border-purple-300 bg-purple-200 text-purple-800 text-sm font-medium">
                                                        {item?.name || id}
                                                    </span>
                                                );
                                            })
                                            : <span className="text-slate-500 italic text-sm">No selections</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        disabled={disabled}
                        onClick={handleSave}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealPreferences;