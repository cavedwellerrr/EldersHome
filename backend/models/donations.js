import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },

  donationType: {
    type: String,
    enum: ["cash", "item"],
    required: true,
  },

  // For cash donations
  amount: { type: Number },

  // For item donations
  itemName: { type: String, lowercase: true},
  quantity: { type: Number },

  // Stripe payment id for cash donations
  paymentId: { type: String },
  sessionId: {type: String},

  // Status
  status: {
    type: String,
    enum: ["pending", "received"],
    default: "pending",
  },

  
  listAcknowledgment: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
