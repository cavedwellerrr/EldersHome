import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api.js";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"];

const Pill = ({ tone = "neutral", children, onRemove }) => {
    const toneMap = {
        neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
        good: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bad: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border ${toneMap[tone]}`}>
            {children}
            {onRemove && (
                <button
                    type="button"
                    className="rounded-md px-1.5 hover:bg-black/5"
                    onClick={onRemove}
                    aria-label="Remove"
                    title="Remove"
                >
                    ✕
                </button>
            )}
        </span>
    );
};

const fieldBase =
    "w-full rounded-xl border border-neutral-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#F29B77] transition";

const AddMealModal = ({ open, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other");
    const [toInclude, setToInclude] = useState([]);
    const [toAvoid, setToAvoid] = useState([]);
    const [currentInclude, setCurrentInclude] = useState("");
    const [currentAvoid, setCurrentAvoid] = useState("");
    const [loading, setLoading] = useState(false);

    const pushUnique = (arr, val) => {
        const v = val.trim();
        if (!v) return arr;
        if (arr.map((x) => x.toLowerCase()).includes(v.toLowerCase())) return arr;
        return [...arr, v];
    };

    const addInclude = () => setToInclude((p) => pushUnique(p, currentInclude)) || setCurrentInclude("");
    const addAvoid = () => setToAvoid((p) => pushUnique(p, currentAvoid)) || setCurrentAvoid("");
    const onKeyAdd = (e, fn) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            fn();
        }
    };

    const removeInclude = (i) => setToInclude((prev) => prev.filter((_, idx) => idx !== i));
    const removeAvoid = (i) => setToAvoid((prev) => prev.filter((_, idx) => idx !== i));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { name, description, category, restrictions: { toInclude, toAvoid } };
            await api.post("/meals", payload);
            toast.success("Meal added successfully!");

            // reset
            setName("");
            setDescription("");
            setCategory("Other");
            setToInclude([]);
            setToAvoid([]);
            setCurrentInclude("");
            setCurrentAvoid("");

            onClose?.();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to add meal");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* overlay */}
            <div className="fixed inset-0 z-[99] bg-black/50" onClick={onClose} />

            {/* modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
                <div
                    className="w-full max-w-2xl rounded-3xl border border-[#F4D7C8] bg-white/95 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* header */}
                    <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl bg-[#FFF2EA] border-b border-[#F4D7C8]">
                        <h3 className="text-xl md:text-2xl font-semibold text-neutral-900">Add New Meal</h3>
                        <button className="rounded-lg p-2 hover:bg-black/5" onClick={onClose} aria-label="Close" title="Close">
                            ✕
                        </button>
                    </div>

                    {/* body */}
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Meal Name *</label>
                            <input
                                type="text"
                                placeholder="Enter meal name"
                                className={`${fieldBase} py-2.5 px-3`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description *</label>
                            <textarea
                                className={`${fieldBase} h-28 py-2.5 px-3 resize-y`}
                                placeholder="Describe the meal..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Category *</label>
                            <select
                                className={`${fieldBase} py-2.5 px-3`}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Includes */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">To Include</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., High protein, Vegetables"
                                    className={`${fieldBase} flex-1 py-2.5 px-3`}
                                    value={currentInclude}
                                    onChange={(e) => setCurrentInclude(e.target.value)}
                                    onKeyDown={(e) => onKeyAdd(e, addInclude)}
                                />
                                <button
                                    type="button"
                                    className="rounded-xl bg-[#F29B77] text-white px-4 py-2.5 text-sm shadow hover:brightness-95"
                                    onClick={addInclude}
                                    disabled={!currentInclude.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {toInclude.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {toInclude.map((item, idx) => (
                                        <Pill key={`inc-${idx}`} tone="good" onRemove={() => removeInclude(idx)}>
                                            {item}
                                        </Pill>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avoid */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">To Avoid</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., Sugar, High sodium"
                                    className={`${fieldBase} flex-1 py-2.5 px-3`}
                                    value={currentAvoid}
                                    onChange={(e) => setCurrentAvoid(e.target.value)}
                                    onKeyDown={(e) => onKeyAdd(e, addAvoid)}
                                />
                                <button
                                    type="button"
                                    className="rounded-xl bg-[#F29B77] text-white px-4 py-2.5 text-sm shadow hover:brightness-95"
                                    onClick={addAvoid}
                                    disabled={!currentAvoid.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {toAvoid.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {toAvoid.map((item, idx) => (
                                        <Pill key={`avd-${idx}`} tone="bad" onRemove={() => removeAvoid(idx)}>
                                            {item}
                                        </Pill>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                className="px-4 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`rounded-xl px-5 py-2.5 text-white shadow ${loading ? "bg-[#F29B77]/70 cursor-not-allowed" : "bg-[#F29B77] hover:brightness-95"
                                    }`}
                                disabled={loading}
                            >
                                {loading ? "Adding..." : "Add Meal"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddMealModal;
