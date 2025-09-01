import { Link } from "react-router-dom";
import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { formatDate } from "../components/util.js";

const Pill = ({ children, tone = "neutral" }) => {
    const tones = {
        neutral: "bg-base-200 text-base-content",
        good:
            "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30 hover:ring-emerald-400/50",
        bad:
            "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30 hover:ring-rose-400/50",

    };
    return (
        <span className={`inline-block text-xs px-2 py-1 rounded-full ${tones[tone]}`}>
            {children}
        </span>
    );
};


const MealCard = ({ meal }) => {
    const toInclude = meal?.restrictions?.toInclude || [];
    const toAvoid = meal?.restrictions?.toAvoid || [];

    const created =
        meal?.createdAt ? formatDate(new Date(meal.createdAt)) : "—";

    return (
        <Link
            to={`/meal/${meal._id}`}
            className="card bg-base-300 shadow-lg hover:shadow-xl transition-all duration-200 border-t-4 border-primary"
        >
            <div className="card-body">
                <h3 className="card-title text-base-content">{meal?.name}</h3>

                <p className="text-base-content/70 line-clamp-3">{meal?.description}</p>

                {/* Restrictions */}
                <div className="mt-4 space-y-3">
                    <div>
                        <p className="text-xs font-medium text-emerald-300/90 mb-2  tracking-wide">
                            Includes
                        </p>
                        {toInclude.length ? (
                            <div className="flex flex-wrap gap-2">
                                {toInclude.map((item, i) => (
                                    <Pill key={`inc-${meal._id}-${i}`} tone="good">
                                        {item}
                                    </Pill>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-base-content/50">
                                No specific inclusions
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-rose-300/90 mb-2 tracking-wide">
                            Avoid
                        </p>
                        {toAvoid.length ? (
                            <div className="flex flex-wrap gap-2">
                                {toAvoid.map((item, i) => (
                                    <Pill key={`avd-${meal._id}-${i}`} tone="bad">
                                        {item}
                                    </Pill>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-base-content/50">
                                No specific restrictions
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="card-actions justify-between items-center mt-4">
                    <span className="text-sm text-base-content/60">{created}</span>

                    <div className="flex items-center gap-1">
                        {/* (Optional) Edit icon as visual affordance */}
                        <PenSquareIcon className="size-4 opacity-60" />

                        {/* Delete button (wire up later) */}
                        <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={(e) => {
                                e.preventDefault(); // prevent <Link> navigation
                                // hook up delete handler here (e.g., open confirm modal)
                            }}
                            aria-label="Delete meal"
                            title="Delete meal"
                        >
                            <Trash2Icon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default MealCard;
