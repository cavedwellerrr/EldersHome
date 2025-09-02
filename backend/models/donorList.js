import mongoose from "mongoose";

const donorListSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DonorList", donorListSchema);
