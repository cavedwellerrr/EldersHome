import { useState } from "react";
import { PlusIcon } from "lucide-react";
import AddMealModal from "./AddMealModal";
import MealPreferencesSummaryDownload from "./MealPreferencesSummaryDownload"

const MealHeader = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="mb-6">
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {/* <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div> */}
                            <div>
                                <div className="bg-white rounded-2xl shadow-lg border border-orange-100">
                                    <MealPreferencesSummaryDownload />
                                </div>
                                {/* <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2> */}

                            </div>
                        </div>

                        <button
                            onClick={() => setOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 active:scale-[.98] transition-all duration-200"
                        >
                            <PlusIcon className="size-5" />
                            <span className="hidden sm:inline">Add New Meal</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>
            </div>

            <AddMealModal open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default MealHeader;