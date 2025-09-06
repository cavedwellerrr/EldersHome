import Donation from "../models/donations.js";
import DonorList from "../models/donorList.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    console.log("Received donation request:", { donorName, donationType, amount });

    let donation;

    if (donationType === "item") {
      // Item donation
      donation = await Donation.create({
        donorName,
        donorEmail,
        donationType,
        itemName,
        quantity: quantity || 1,
        listAcknowledgment,
        status: "pending",
      });
      console.log("Item donation created:", donation._id);
      return res.status(201).json(donation);
    } 
    else if (donationType === "cash") {
      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create donation document first (without sessionId yet)
      donation = await Donation.create({
        donorName,
        donorEmail,
        donationType,
        amount: parseFloat(amount),
        listAcknowledgment,
        status: "pending",
        addToDonorList: false,
      });

      console.log("Cash donation created:", donation._id);

      // Create Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Cash Donation" },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}donations/success?session_id={CHECKOUT_SESSION_ID}&donation_id=${donation._id}`,
        cancel_url: `${process.env.FRONTEND_URL}donations`,
        metadata: { donationId: donation._id.toString() },
      });

      // **Save sessionId to donation document**
      donation.sessionId = session.id;
      await donation.save();

      console.log("Stripe session created and saved:", {
        sessionId: session.id,
        donationId: donation._id,
        url: session.url,
      });

      return res.status(201).json({ url: session.url });
    } 
    else {
      return res.status(400).json({ message: "Invalid donation type" });
    }

  } catch (error) {
    console.error("Error creating donation:", error);
    return res.status(500).json({ message: error.message });
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

    if (status && ["pending", "received"].includes(status)) {
      donation.status = status;
    }

    if (typeof addToDonorList === "boolean") {
      donation.addToDonorList = addToDonorList;

      if (addToDonorList) {
        const exists = await DonorList.findOne({ donorName: donation.donorName });
        if (!exists) {
          await DonorList.create({ donorName: donation.donorName, donationDate: new Date() });
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

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, donationId } = req.query;

    console.log("Verifying payment:", { sessionId, donationId });

    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log("Donation not found for ID:", donationId);
      return res.status(404).json({ message: "Donation not found" });
    }

    console.log("Stored sessionId:", donation.sessionId, "Received sessionId:", sessionId);
    if (donation.sessionId !== sessionId) {
      console.log("Session ID mismatch");
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe session retrieved:", { payment_status: session.payment_status, payment_intent: session.payment_intent });

    if (session.payment_status === "paid") {
      donation.status = "received";
      donation.paymentId = session.payment_intent;
      await donation.save();
      console.log("Payment verified, donation updated:", { donationId: donation._id, paymentId: donation.paymentId });
      return res.status(200).json({ message: "Payment verified", donation });
    } else {
      console.log("Payment not completed, status:", session.payment_status);
      return res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error verifying payment" });
  }
};