import express from "express";
import ElderMealPreference from "../models/elder_meal_preference.js";

const router = express.Router();

/**
 * GET /api/meal-preferences/summary
 * Returns all elder meal preferences (with populated meals)
 */
router.get("/summary", async (req, res) => {
    try {
        const prefs = await ElderMealPreference.find({})
            .populate("elder", "fullName")
            .populate("selections.breakfast", "name category")
            .populate("selections.lunch", "name category")
            .populate("selections.dinner", "name category")
            .populate("selections.snacks", "name category")
            .populate("selections.other", "name category");

        res.json(prefs);
    } catch (err) {
        console.error("Error fetching meal preferences summary:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
