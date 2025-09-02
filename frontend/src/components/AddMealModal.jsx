import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api.js";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Other"];

const AddMealModal = ({ open, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Other"); // NEW
    const [toInclude, setToInclude] = useState([]);
    const [toAvoid, setToAvoid] = useState([]);
    const [currentInclude, setCurrentInclude] = useState("");
    const [currentAvoid, setCurrentAvoid] = useState("");
    const [loading, setLoading] = useState(false);

    const addInclude = () => {
        const v = currentInclude.trim();
        if (!v) return;
        setToInclude((prev) => [...prev, v]);
        setCurrentInclude("");
    };

    const addAvoid = () => {
        const v = currentAvoid.trim();
        if (!v) return;
        setToAvoid((prev) => [...prev, v]);
        setCurrentAvoid("");
    };

    const removeInclude = (i) => {
        setToInclude((prev) => prev.filter((_, idx) => idx !== i));
    };

    const removeAvoid = (i) => {
        setToAvoid((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name,
                description,
                category, // NEW
                restrictions: {
                    toInclude,
                    toAvoid,
                },
            };

            const { data } = await api.post("/meals", payload);
            console.log("Meal added:", data);
            toast.success("Meal added successfully!");

            // reset
            setName("");
            setDescription("");
            setCategory("Other"); // NEW
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
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            {/* modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="modal-box w-full max-w-2xl bg-base-100 relative">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <h3 className="font-bold text-2xl mb-6 text-primary">Add New Meal</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Meal Name *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter meal name"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Description *</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-24"
                                placeholder="Describe the meal..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Category (NEW) */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Category *</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
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
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">To Include</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., High protein, Vegetables"
                                    className="input input-bordered flex-1"
                                    value={currentInclude}
                                    onChange={(e) => setCurrentInclude(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addInclude();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={addInclude}
                                    disabled={!currentInclude.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {toInclude.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {toInclude.map((item, idx) => (
                                        <div key={`inc-${idx}`} className="badge badge-success gap-2">
                                            {item}
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs text-white"
                                                onClick={() => removeInclude(idx)}
                                                aria-label="Remove include"
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Avoid */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">To Avoid</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., Sugar, High sodium"
                                    className="input input-bordered flex-1"
                                    value={currentAvoid}
                                    onChange={(e) => setCurrentAvoid(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addAvoid();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={addAvoid}
                                    disabled={!currentAvoid.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {toAvoid.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {toAvoid.map((item, idx) => (
                                        <div key={`avd-${idx}`} className="badge badge-error gap-2">
                                            {item}
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs text-white"
                                                onClick={() => removeAvoid(idx)}
                                                aria-label="Remove avoid"
                                                title="Remove"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className={`btn btn-primary ${loading ? "loading" : ""}`}
                                disabled={loading}
                            >
                                {loading ? "Adding Meal..." : "Add Meal"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddMealModal;