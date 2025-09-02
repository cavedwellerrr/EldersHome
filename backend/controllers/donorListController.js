import DonorList from "../models/donorList.js";

// Get all donors
export const getAllDonors = async (req, res) => {
  try {
    const donors = await DonorList.find().sort({ donationDate: -1 }); // newest first
    res.status(200).json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({ message: "Server error fetching donors" });
  }
};
