import { useState } from "react";
import { PlusIcon } from "lucide-react";
import AddMealModal from "./AddMealModal";

const Mealheader = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* space below navbar */}
            <div className="h-3 md:h-4" />

            <header className="mx-auto max-w-6xl px-4">
                <div className="rounded-xl bg-blue-50/5 backdrop-blur supports-[backdrop-filter]:bg-blue-50/10 border border-white/10 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3">
                        <h1 className="text-xl md:text-2xl font-semibold text-white/90 tracking-tight">
                            Meal Management
                        </h1>
                        <button
                            onClick={() => setOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 text-sm font-medium transition"
                        >
                            <PlusIcon className="size-5" />
                            <span>New Meal</span>
                        </button>
                    </div>
                </div>
            </header>

            <AddMealModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default Mealheader;
