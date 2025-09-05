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


// Delete donor
export const deleteDonor = async (req, res) => {
  try {
    const donor = await DonorList.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    await donor.deleteOne();

    res.json({ message: "Donor deleted successfully" });
  } catch (error) {
    console.error("Error deleting donor:", error);
    res.status(500).json({ message: "Server error deleting donor" });
  }
};
