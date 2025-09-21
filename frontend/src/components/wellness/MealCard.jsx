import React, { useState } from "react";
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { formatDate } from "./mealUtil.js";
import EditMealModal from "./EditMealModal.jsx";
import toast from "react-hot-toast";
import api from "../../api.js";

const Tag = ({ children, tone = "neutral" }) => {
    const tones = {
        neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
        good: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bad: "bg-rose-50 text-rose-700 border-rose-200",
        info: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
        <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${tones[tone]}`}>
            {children}
        </span>
    );
};

const MealCard = ({ meal, onUpdated }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async (mealId) => {
        if (!window.confirm("Delete this meal?")) return;
        try {
            await api.delete(`/meals/${mealId}`);
            toast.success("Meal deleted", { duration: 5000 });
            setTimeout(() => {
                onUpdated?.();
            }, 300);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to delete meal");
        }
    };

    const toInclude = meal?.restrictions?.toInclude || [];
    const toAvoid = meal?.restrictions?.toAvoid || [];
    const created = meal?.createdAt ? formatDate(new Date(meal.createdAt)) : "—";

    return (
        <>
            <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="p-5">
                    {/* title + category */}
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{meal?.name}</h3>
                        {!!meal?.category && <Tag tone="info" >{meal.category}</Tag>}
                    </div>

                    {/* desc */}
                    {meal?.description && (
                        <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{meal.description}</p>
                    )}

                    {/* restrictions */}
                    <div className="mt-5 space-y-3">
                        <div>
                            <p className="text-xs font-medium text-emerald-700 mb-2 tracking-wide">Includes</p>
                            {toInclude.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {toInclude.map((item, i) => (
                                        <Tag key={`inc-${meal._id}-${i}`} tone="good">{item}</Tag>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500">No specific inclusions</p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-medium text-rose-700 mb-2 tracking-wide">Avoid</p>
                            {toAvoid.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {toAvoid.map((item, i) => (
                                        <Tag key={`avd-${meal._id}-${i}`} tone="bad">{item}</Tag>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-500">No specific restrictions</p>
                            )}
                        </div>
                    </div>

                    {/* footer */}
                    <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Added {created}</span>
                        <div className="flex items-center gap-1">
                            <button
                                className="rounded-lg px-2 py-1 text-neutral-700 hover:bg-neutral-100"
                                onClick={() => setIsEditOpen(true)}
                                title="Edit"
                            >
                                <PenSquareIcon className="size-4" />
                            </button>
                            <button
                                className="rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleDelete(meal._id)}
                                title="Delete"
                            >
                                <Trash2Icon className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditMealModal
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                meal={meal}
                onUpdated={() => onUpdated?.()}
            />
        </>
    );
};

export default MealCard;