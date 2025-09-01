import { useEffect, useState } from "react";
import Mealheader from "../components/MealHeader";
import api from "../api.js";
import toast from "react-hot-toast";
import MealCard from "../components/MealCard";

const MealPage = () => {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const res = await api.get("/meals");
                const payload = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data ?? res.data?.meals ?? [];
                setMeals(Array.isArray(payload) ? payload : []);
            } catch (error) {
                toast.error(error?.response?.data?.message || "Failed to load meals");
                console.error("Error fetching meals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, []);

    return (
        <div className="min-h-screen">
            <Mealheader />

            <div className="max-w-7xl mx-auto p-4 mt-6">
                {loading && (
                    <div className="text-center text-primary py-10">Loading meals...</div>
                )}

                {!loading && meals.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No meals found.
                    </div>
                )}

                {meals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {meals.map((meal) => (
                            <MealCard key={meal._id} meal={meal} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPage;
