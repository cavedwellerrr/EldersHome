import Elder from "../models/elder_model.js";
import Staff from "../models/staff_model.js";
import Caretaker from "../models/caretaker_model.js";
import nodemailer from "nodemailer";

export const assignCaretaker = async (req, res) => {
  try {
    const { caretakerId, elderId } = req.body;

    const staff = await Staff.findById(caretakerId);
    if (!staff || staff.role !== "caretaker") {
      return res.status(400).json({ message: "Invalid caretaker staff" });
    }

    const elder = await Elder.findById(elderId).populate("guardian");
    if (!elder) {
      return res.status(400).json({ message: "Elder not found" });
    }

    let caretaker = await Caretaker.findOne({ staff: caretakerId });
    if (!caretaker) {
      caretaker = new Caretaker({ staff: caretakerId, assignedElders: [] });
    }
    if (elder.status === "APPROVED_AWAITING_PAYMENT") {
      elder.status = "ACTIVE";
    }

    if (!caretaker.assignedElders.includes(elderId)) {
      caretaker.assignedElders.push(elderId);
    }
    await caretaker.save();

    elder.caretaker = caretaker._id;
    await elder.save();

    if (elder.guardian?.email) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Elder Care Home" <${process.env.GMAIL_USER}>`,
        to: elder.guardian.email,
        subject: `Caretaker Assigned for ${elder.fullName}`,
        text: `Dear ${
          elder.guardian.name || "Guardian"
        },\n\nA caretaker has been assigned to your elder,${
          elder.fullName
        }.\nCaretaker: ${staff.name}\n\nThank you,\nElder Care Home`,
        html: `<p>Dear ${elder.guardian.fullName || "Guardian"},</p>
               <p>A caretaker has been assigned to <strong>${
                 elder.fullName
               }</strong>.</p>
               <p><b>Caretaker:</b> ${staff.name}</p>
               <p>Thank you,<br/>Elder Care Home</p>`,
      });
    }

    res.json({ message: "Caretaker assigned successfully", elder });
  } catch (error) {
    console.error("Assign caretaker error:", error);
    res.status(500).json({ message: error.message });
  }
};
