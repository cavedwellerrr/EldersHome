import mongoose from "mongoose";
const { Schema } = mongoose;

const selectionsSchema = new Schema(
    {
        breakfast: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
        lunch: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
        dinner: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
        snacks: [{ type: Schema.Types.ObjectId, ref: "Meal" }],
        other: [{ type: Schema.Types.ObjectId, ref: "Meal" }],   // 👈 NEW field
    },
    { _id: false }
);

const elderMealPreferenceSchema = new Schema(
    {
        elder: { type: Schema.Types.ObjectId, ref: "Elder", required: true, unique: true },
        allergies: [String],
        selections: { type: selectionsSchema, default: () => ({}) },
        notes: String,
        lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    },
    { timestamps: true }
);

export default mongoose.model("ElderMealPreference", elderMealPreferenceSchema);
