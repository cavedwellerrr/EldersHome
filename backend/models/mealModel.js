import mongoose from "mongoose";

// Meal Schema
const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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
