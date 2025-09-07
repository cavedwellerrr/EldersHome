// controllers/assignmentMealPrefController.js
import mongoose from "mongoose";
import ElderMealPreference from "../models/elder_meal_preference.js";
import Meal from "../models/meal_model.js";

/**
 * GET /api/assign/meals/categories
 * Single source of truth for categories (kept in sync with your schema)
 */
export const listMealCategories = async (_req, res) => {
    return res.json({ success: true, categories: ["Breakfast", "Lunch", "Dinner", "Snack", "Other"] });
};

/**
 * GET /api/assign/meals/options?category=Breakfast&q=
 * Filter meals by category and optional name search
 */
export const listMealsByCategory = async (req, res) => {
    try {
        const { category, q } = req.query;
        const where = {};
        if (category) where.category = String(category).trim();
        if (q) where.name = new RegExp(String(q).trim(), "i");

        const meals = await Meal.find(where).sort({ category: 1, name: 1 }).lean();
        return res.json({ success: true, count: meals.length, meals });
    } catch (err) {
        console.error("listMealsByCategory error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * GET /api/assign/meals/:elderId
 * Get current preferences for an elder (populated)
 */
export const getElderMealPreferences = async (req, res) => {
    try {
        const { elderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(elderId)) {
            return res.status(400).json({ success: false, message: "Invalid elderId" });
        }

        const pref = await ElderMealPreference.findOne({ elder: elderId })
            .populate([
                { path: "selections.breakfast", select: "name category" },
                { path: "selections.lunch", select: "name category" },
                { path: "selections.dinner", select: "name category" },
                { path: "selections.snacks", select: "name category" },
            ])
            .lean();

        if (!pref) {
            return res.json({
                success: true,
                exists: false,
                preference: {
                    elder: elderId,
                    allergies: [],
                    selections: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                    notes: "",
                },
            });
        }

        return res.json({ success: true, exists: true, preference: pref });
    } catch (err) {
        console.error("getElderMealPreferences error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * PUT /api/assign/meals/:elderId
 * Body: { allergies, notes, selections: { breakfast: [], lunch: [], dinner: [], snacks: [] } }
 * Upsert + validate payload shape
 */
export const upsertElderMealPreferences = async (req, res) => {
    try {
        const { elderId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(elderId)) {
            return res.status(400).json({ success: false, message: "Invalid elderId" });
        }

        const { allergies = [], notes = "", selections = {} } = req.body;

        const normIds = (arr) =>
            (Array.isArray(arr) ? arr : []).filter(Boolean).map(String);

        const updateDoc = {
            elder: elderId,
            allergies: (Array.isArray(allergies) ? allergies : [])
                .map(String)
                .filter((s) => s.length),
            notes: String(notes || ""),
            selections: {
                breakfast: normIds(selections.breakfast),
                lunch: normIds(selections.lunch),
                dinner: normIds(selections.dinner),
                snacks: normIds(selections.snacks),
            },
            lastUpdatedBy: req.staff?._id || null,
        };

        const updated = await ElderMealPreference.findOneAndUpdate(
            { elder: elderId },
            updateDoc,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        return res.json({ success: true, preference: updated });
    } catch (err) {
        console.error("upsertElderMealPreferences error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};