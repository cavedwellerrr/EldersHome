import mongoose from "mongoose";

// Meal Schema
const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Other"],
        default: "Other"
    },
    restrictions: {
        toAvoid: [String],
        toInclude: [String],
    }
}, {
    timestamps: true //updated At,created At
});

// Create Model
const Meal = mongoose.model("Meal", mealSchema);

export default Meal;