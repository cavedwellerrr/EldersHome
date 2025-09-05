// donationController.js
import Donation from "../models/donations.js";
import DonorList from "../models/donorList.js";

// Create donation
export const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donationType,
      amount,
      itemName,
      quantity,
      listAcknowledgment,
    } = req.body;

    const donation = await Donation.create({
      donorName,
      donorEmail,
      donationType,
      amount: donationType === "cash" ? amount : undefined,
      itemName: donationType === "item" ? itemName : undefined,
      quantity: donationType === "item" ? quantity || 1 : undefined,
      listAcknowledgment,
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Server error while fetching donations" });
  }
};

// Update donation status and optionally add donor to DonorList
export const updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const { status, addToDonorList } = req.body;

    // Update donation status if provided
    if (status && ["pending", "received"].includes(status)) {
      donation.status = status;
    }

    // Update DonorList if admin checked/unchecked
    if (typeof addToDonorList === "boolean") {
      // Track admin's choice
      donation.addToDonorList = addToDonorList;

      if (addToDonorList) {
        const exists = await DonorList.findOne({ donorName: donation.donorName });
        if (!exists) {
          await DonorList.create({ donorName: donation.donorName });
        }
      } else {
        await DonorList.deleteOne({ donorName: donation.donorName });
      }
    }

    await donation.save();
    res.json({ message: "Donation updated successfully", donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating donation" });
  }
};

// Delete donation
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // If donation was linked to donor list, remove donor only if they have no other donations
    if (donation.addToDonorList) {
      const donorDonations = await Donation.find({
        donorName: donation.donorName,
        _id: { $ne: donation._id },
      });

      if (donorDonations.length === 0) {
        await DonorList.deleteOne({ donorName: donation.donorName });
      }
    }

    await donation.deleteOne();

    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ message: "Server error while deleting donation" });
  }
};

