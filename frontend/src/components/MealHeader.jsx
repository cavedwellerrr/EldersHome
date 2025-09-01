import { useState } from "react";
import { PlusIcon } from "lucide-react";
import AddMealModal from "./AddMealModal";

const Mealheader = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="bg-base-300 border-b border-base-content/10">
            <div className="mx-auto max-w-6xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-primary font-mono tracking-tighter">
                        Meal Management
                    </h1>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setOpen(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <PlusIcon className="size-5" />
                            <span>New Meal Type</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            <AddMealModal open={open} onClose={() => setOpen(false)} />
        </header>
    );
};

export default Mealheader;
