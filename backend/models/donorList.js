import mongoose from "mongoose";

const donorListSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donationDate: { type: Date, default: Date.now },
});

const DonorList = mongoose.model("DonorList", donorListSchema);
export default DonorList;
