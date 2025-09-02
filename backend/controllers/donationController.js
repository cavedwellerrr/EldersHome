
import Donation from "../models/donation_model.js";


export const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      type,             
      amount,           
      itemDescription,   
      quantity,         
      acknowledgePublicly 
    } = req.body;

    // create donation record
    const donation = await Donation.create({
      donorName,
      donorEmail,
      type,
      amount: type === "cash" ? amount : undefined,
      itemDescription: type === "item" ? itemDescription : undefined,
      quantity: type === "item" ? quantity || 1 : undefined,
      acknowledgePublicly
    });

    // For cash donations, you might return a payment URL here for redirection
    res.status(201).json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
