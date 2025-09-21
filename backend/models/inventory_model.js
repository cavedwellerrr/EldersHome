import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },
  totalQuantity: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to auto-update updatedAt
inventorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
