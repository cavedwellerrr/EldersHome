import { useState } from "react";
import { PlusIcon } from "lucide-react";
import AddMealModal from "./AddMealModal";

const MealHeader = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="h-3 md:h-4" />
            <header className="mx-auto max-w-7xl px-4">
                <div className="rounded-2xl border border-[#F4D7C8] bg-white/75 backdrop-blur shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900">
                            Meal Management
                        </h1>

                        <button
                            onClick={() => setOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#F29B77] text-white px-4 py-2.5 text-sm md:text-base shadow hover:brightness-95 active:scale-[.99] transition"
                        >
                            <PlusIcon className="size-5" />
                            <span className="hidden sm:inline">New Meal</span>
                        </button>
                    </div>
                </div>
            </header>

            <AddMealModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default MealHeader;