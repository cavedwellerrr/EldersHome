import Donation from "../models/donations.js";
import DonorList from "../models/donorList.js";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { addDonationToInventory } from "./inventoryController.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a reusable transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
};

// Async email function that doesn't block responses
const sendThankYouEmail = async (donation) => {
  try {
    if (!donation.donorEmail) return;

    const emailTransporter = getTransporter();
    
    await emailTransporter.sendMail({
      from: `"Elder Care Home" <${process.env.GMAIL_USER}>`,
      to: donation.donorEmail,
      subject: "Thank You for Your Donation",
      text: `Dear ${donation.donorName || "Donor"},\n\nThank you for your ${
        donation.donationType
      } donation. It is greatly appreciated and will make a meaningful difference.\n\nWith gratitude,\nElder Care Home`,
      html: `<p>Dear ${donation.donorName || "Donor"},</p>
             <p>Thank you for your <strong>${donation.donationType}</strong> donation. It is greatly appreciated and will make a meaningful difference.</p>
             <p>With gratitude,<br/>Elder Care Home</p>`,
    });
    
    console.log(`Thank you email sent to: ${donation.donorEmail}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    // Don't throw error - email failure shouldn't break the donation process
  }
};

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

      // Save sessionId to donation document
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
    let wasStatusUpdatedToReceived = false;

    // Update status
    if (status && ["pending", "received"].includes(status)) {
      wasStatusUpdatedToReceived = (donation.status !== "received" && status === "received");
      donation.status = status;
    }

    // Handle donor list updates
    if (typeof addToDonorList === "boolean") {
      donation.addToDonorList = addToDonorList;

      try {
        if (addToDonorList) {
          const exists = await DonorList.findOne({ donorName: donation.donorName });
          if (!exists) {
            await DonorList.create({ 
              donorName: donation.donorName, 
              donationDate: new Date() 
            });
          }
        } else {
          await DonorList.deleteOne({ donorName: donation.donorName });
        }
      } catch (donorListError) {
        console.error("Error updating donor list:", donorListError);
        // Continue with donation update even if donor list update fails
      }
    }

    // Save donation
    await donation.save();

    // Send response immediately
    res.json({ 
      message: "Donation updated successfully", 
      donation: {
        ...donation.toObject(),
      }
    });

    // ✅ After response is sent
    if (wasStatusUpdatedToReceived) {
      // Add item donations to inventory
      if (donation.donationType === "item") {
        addDonationToInventory(donation._id);
      }

      // Send thank-you email
      sendThankYouEmail(donation).catch(error => {
        console.error("Background email sending failed:", error);
      });
    }

  } catch (error) {
    console.error("Error updating donation:", error);
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

    // Handle donor list cleanup
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

      // Send response immediately
      res.status(200).json({ message: "Payment verified", donation });

      // Send email asynchronously AFTER response is sent
      sendThankYouEmail(donation).catch(error => {
        console.error("Background email sending failed:", error);
      });
      
    } else {
      console.log("Payment not completed, status:", session.payment_status);
      return res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error verifying payment" });
  }
};