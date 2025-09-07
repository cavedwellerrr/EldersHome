// controllers/mealController.js
import mongoose from "mongoose";
import Meal from "../models/meal_model.js";

// READ all meals
export const getMeals = async (_req, res) => {
    try {
        const meals = await Meal.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: meals });
    } catch (error) {
        console.error("Error fetching meals:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ADD new meal
export const addMeal = async (req, res) => {
    const {
        name,
        description,
        restrictions = {},
        category, // new field
    } = req.body;

    if (!name || !description) {
        return res
            .status(400)
            .json({ success: false, message: "Please fill all fields" });
    }

    // Normalize arrays; allow sending string or array
    const toArray = (v) =>
        Array.isArray(v) ? v : (v ? [String(v)] : []);

    const doc = {
        name: String(name).trim(),
        description: String(description).trim(),
        restrictions: {
            toAvoid: toArray(restrictions.toAvoid),
            toInclude: toArray(restrictions.toInclude),
        },
    };

    if (category !== undefined) {
        doc.category = String(category).trim();
    }

    try {
        const newMeal = await Meal.create(doc);
        res.status(201).json({ success: true, data: newMeal });
    } catch (error) {
        console.error("Error creating meal:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// DELETE a meal
export const deleteMeal = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Invalid meal ID" });
    }

    try {
        const deleted = await Meal.findByIdAndDelete(id);
        if (!deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Meal not found" });
        }
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting meal:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// UPDATE a meal
export const updateMeal = async (req, res) => {
    const { id } = req.params;
    const payload = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Invalid meal ID" });
    }

    // Only allow specific fields to be updated
    const update = {};
    if (payload.name !== undefined) update.name = String(payload.name).trim();
    if (payload.description !== undefined)
        update.description = String(payload.description).trim();
    if (payload.category !== undefined)
        update.category = String(payload.category).trim();

    if (payload.restrictions) {
        const toArray = (v) =>
            Array.isArray(v) ? v : (v ? [String(v)] : []);
        update.restrictions = {
            ...(payload.restrictions.toAvoid !== undefined && {
                toAvoid: toArray(payload.restrictions.toAvoid),
            }),
            ...(payload.restrictions.toInclude !== undefined && {
                toInclude: toArray(payload.restrictions.toInclude),
            }),
        };
    }

    try {
        const updatedMeal = await Meal.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        });
        if (!updatedMeal) {
            return res
                .status(404)
                .json({ success: false, message: "Meal not found" });
        }
        res.status(200).json({ success: true, data: updatedMeal });
    } catch (error) {
        console.error("Error updating meal:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};