// donationController.js
import Donation from "../models/donations.js";

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

    // Create donation record
    const donation = await Donation.create({
      donorName,
      donorEmail,
      donationType,
      amount: donationType === "cash" ? amount : undefined,
      itemName: donationType === "item" ? itemName : undefined,
      quantity: donationType === "item" ? quantity || 1 : undefined,
      listAcknowledgment,
    });

    // Return the created donation (you can later add Stripe payment link if cash)
    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    // Fetch donations sorted by newest first
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Server error while fetching donations" });
  }
};

//update donation status

export const updateDonationStatus = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const { status } = req.body;

    // Ensure only valid status values are allowed
    if (!["pending", "received"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    donation.status = status;
    await donation.save();

    res.json({ message: "Status updated successfully", donation });
  } catch (error) {
    console.error("Error updating donation status:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};