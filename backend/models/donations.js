import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String },
  type: { 
    type: String, 
    enum: ["cash", "item"], 
    required: true 
  }, // type of donation
  
  // For cash donations
  amount: { type: Number }, 
  paymentId: { type: String }, 
  
  // For item donations
  itemDescription: { type: String }, // table or chair
  quantity: { type: Number, default: 1 },

  acknowledgePublicly: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  paymentId: { type: String }, // stores Stripe/PayPal ID for cash donation
  status: { type: String, enum: ["pending", "received"], default: "pending" },

});

// Validation logic so at least one field makes sense
donationSchema.pre("validate", function (next) {
  if (this.type === "cash" && !this.amount) {
    return next(new Error("Cash donation must have an amount."));
  }
  if (this.type === "item" && !this.itemDescription) {
    return next(new Error("Item donation must have an item description."));
  }
  next();
});

export default mongoose.model("Donation", donationSchema);
