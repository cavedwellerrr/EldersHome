import Elder, { ElderStatus } from "../models/elder_model.js";
import Payment, { PaymentStatus } from "../models/payment_model.js";
import nodemailer from "nodemailer";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

// Guardian creates elder registration request
export const createElderRequest = async (req, res) => {
  try {
    // Log req.body and req.file for debugging
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "No form data received" });
    }

    const { fullName, dob, gender, address, medicalNotes } = req.body;
    const guardianId = req.guardian._id; // From protect middleware

    // Validate required fields
    if (!fullName || !dob || !gender || !address || !medicalNotes) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const nameRegex = /^[A-Za-z\s]{3,}$/;
    if (!nameRegex.test(fullName)) {
      return res.status(400).json({
        message:
          "Full name must be at least 3 characters long and contain only letters and spaces",
      });
    }

    const elder = new Elder({
      fullName,
      dob,
      gender,
      address,
      medicalNotes,
      pdfPath: req.file ? req.file.path : null, // Store PDF path if uploaded
      guardian: guardianId,
      status: ElderStatus.DISABLED_PENDING_REVIEW, // Updated to match schema
    });

    await elder.save();
    res
      .status(201)
      .json({ message: "Elder registration request submitted successfully" });
  } catch (error) {
    console.error("Error in createElderRequest:", error);
    res.status(400).json({ message: error.message });
  }
};

// Operator lists pending elder requests
export const listPendingReview = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.DISABLED_PENDING_REVIEW,
    }).populate("guardian");
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator lists elders with pending payments
export const listPendingPayments = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.APPROVED_AWAITING_PAYMENT,
    })
      .populate({
        path: "guardian",
        select: "fullName name email phoneNumber",
      })
      .populate({
        path: "paymentId",
        match: { status: PaymentStatus.PENDING },
        select: "amount status mockCheckoutUrl reminderSentAt",
      });
    // Filter out elders where paymentId is null (no matching pending payment)
    const filteredElders = elders.filter((elder) => elder.paymentId !== null);
    res.json(filteredElders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator approves request → payment required
export const reviewApprove = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.status = ElderStatus.APPROVED_AWAITING_PAYMENT;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    const payment = await Payment.create({
      elder: elder._id,
      guardian: elder.guardian,
      amount: 5000,
      status: PaymentStatus.PENDING,
      mockCheckoutUrl: `https://mockpay.local/checkout/${elder._id}`,
    });

    elder.paymentId = payment._id;
    await elder.save();

    res.json({ message: "Elder approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator rejects request
export const reviewReject = async (req, res) => {
  try {
    const { reason } = req.body;
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    elder.status = ElderStatus.REJECTED;
    elder.rejectionReason = reason;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    res.json({ message: "Elder rejected", elder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Guardian marks payment as success
export const markPaymentSuccess = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId).populate("elder");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = PaymentStatus.SUCCESS;
    await payment.save();

    payment.elder.status = ElderStatus.PAYMENT_SUCCESS;
    await payment.elder.save();

    res.json({ message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator activates elder after payment
export const activateElder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);
    if (!elder) return res.status(404).json({ message: "Elder not found" });

    if (elder.status !== ElderStatus.PAYMENT_SUCCESS) {
      return res.status(400).json({ message: "Payment not completed" });
    }

    elder.status = ElderStatus.ACTIVE;
    elder.isDisabled = false;
    if (req.user?._id) {
      elder.operator = req.user._id;
    }
    await elder.save();

    res.json({ message: "Elder activated", elder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Operator sends payment reminder email to guardian
export const sendPaymentReminder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id)
      .populate("guardian")
      .populate("paymentId");

    if (!elder) return res.status(404).json({ message: "Elder not found" });

    if (elder.status !== ElderStatus.APPROVED_AWAITING_PAYMENT) {
      return res.status(400).json({ message: "Elder not awaiting payment" });
    }

    if (!elder.guardian?.email) {
      return res.status(400).json({ message: "Guardian email not found" });
    }

    if (!elder.paymentId || elder.paymentId.status !== PaymentStatus.PENDING) {
      return res.status(400).json({ message: "No pending payment found" });
    }

    // Update reminderSentAt
    elder.paymentId.reminderSentAt = new Date();
    await elder.paymentId.save();

    // Configure transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Support" <${process.env.GMAIL_USER}>`,
      to: elder.guardian.email,
      subject: `Payment Reminder for Elder: ${elder.fullName}`,
      text: `Dear Guardian,\n\nThis is a reminder to complete the payment for ${elder.fullName}.\nAmount: ${elder.paymentId.amount}\nPay here: ${elder.paymentId.mockCheckoutUrl}\n\nThank you!`,
      html: `<p>Dear Guardian,</p><p>This is a reminder to complete the payment for <strong>${elder.fullName}</strong>.</p><p>Amount: ${elder.paymentId.amount}</p><p><a href="${elder.paymentId.mockCheckoutUrl}">Pay Now</a></p><p>Thank you!</p>`,
    });

    console.log("Email sent: %s", info.messageId);

    res.json({ message: "Payment reminder sent", info });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all active elders
export const listActiveElders = async (req, res) => {
  try {
    const elders = await Elder.find({
      status: ElderStatus.APPROVED_AWAITING_PAYMENT,
    })
      .populate("guardian")
      .populate("caretaker");
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//list elder by guardian
export const listEldersByGuardian = async (req, res) => {
  try {
    const { guardianId } = req.params;
    if (!req.guardian || req.guardian._id.toString() !== guardianId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const elders = await Elder.find({ guardian: guardianId })
      .populate("guardian", "name email phone")
      .populate({
        path: "caretaker",
        populate: {
          path: "staff",
          select: "name email phone",
        },
      });
    res.json(elders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete elder
export const deleteElder = async (req, res) => {
  try {
    const elder = await Elder.findById(req.params.id);

    if (!elder) {
      return res.status(404).json({ message: "Elder not found" });
    }

    // Check if the requesting guardian owns this elder
    if (elder.guardian.toString() !== req.guardian._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this elder" });
    }

    await Elder.findByIdAndDelete(req.params.id);

    res.json({ message: "Elder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveDisabledStats = async (req, res) => {
  try {
    const activeElders = await Elder.find({
      status: ElderStatus.ACTIVE,
    });
    const disabledElders = await Elder.find({
      status: ElderStatus.DISABLED_PENDING_REVIEW,
    });

    const activeGenderDistribution = await Elder.aggregate([
      { $match: { status: ElderStatus.ACTIVE } },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    const disabledGenderDistribution = await Elder.aggregate([
      { $match: { status: ElderStatus.DISABLED_PENDING_REVIEW } },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    // Age groups for active elders
    const activeAgeGroups = await Elder.aggregate([
      { $match: { status: ElderStatus.ACTIVE } },
      {
        $addFields: {
          age: {
            $cond: [
              { $ne: ["$dob", null] },
              {
                $floor: {
                  $divide: [
                    { $subtract: [new Date(), "$dob"] },
                    1000 * 60 * 60 * 24 * 365.25,
                  ],
                },
              },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [{ $gte: ["$age", 45] }, { $lt: ["$age", 56] }],
                  },
                  then: "45-55",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 56] }, { $lt: ["$age", 66] }],
                  },
                  then: "56-65",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 66] }, { $lt: ["$age", 76] }],
                  },
                  then: "66-75",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 76] }, { $lt: ["$age", 86] }],
                  },
                  then: "76-85",
                },
                {
                  case: { $gte: ["$age", 86] },
                  then: "85+",
                },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: { _id: "$ageGroup", count: { $sum: 1 } },
      },
      { $sort: { _id: 1 } },
    ]);

    // Age groups for disabled elders
    const disabledAgeGroups = await Elder.aggregate([
      { $match: { status: ElderStatus.DISABLED_PENDING_REVIEW } },
      {
        $addFields: {
          age: {
            $cond: [
              { $ne: ["$dob", null] },
              {
                $floor: {
                  $divide: [
                    { $subtract: [new Date(), "$dob"] },
                    1000 * 60 * 60 * 24 * 365.25,
                  ],
                },
              },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          ageGroup: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [{ $gte: ["$age", 45] }, { $lt: ["$age", 56] }],
                  },
                  then: "45-55",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 56] }, { $lt: ["$age", 66] }],
                  },
                  then: "56-65",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 66] }, { $lt: ["$age", 76] }],
                  },
                  then: "66-75",
                },
                {
                  case: {
                    $and: [{ $gte: ["$age", 76] }, { $lt: ["$age", 86] }],
                  },
                  then: "76-85",
                },
                {
                  case: { $gte: ["$age", 86] },
                  then: "85+",
                },
              ],
              default: "Unknown",
            },
          },
        },
      },
      {
        $group: { _id: "$ageGroup", count: { $sum: 1 } },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly registration trends for active elders (last 12 months)
    const currentDate = new Date();
    const twelveMonthsAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 11,
      1
    );

    const monthlyActiveRegistrations = await Elder.aggregate([
      {
        $match: {
          status: ElderStatus.ACTIVE,
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthlyDisabledRegistrations = await Elder.aggregate([
      {
        $match: {
          status: ElderStatus.DISABLED_PENDING_REVIEW,
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatMonthly = (aggData) => {
      const result = [];
      let date = new Date(twelveMonthsAgo);
      for (let i = 0; i < 12; i++) {
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const found = aggData.find(
          (item) => item._id.year === year && item._id.month === month
        );
        result.push({
          month: monthName,
          count: found ? found.count : 0,
        });
        date.setMonth(date.getMonth() + 1);
      }
      return result;
    };

    const formattedActiveMonthly = formatMonthly(monthlyActiveRegistrations);
    const formattedDisabledMonthly = formatMonthly(
      monthlyDisabledRegistrations
    );

    const genderColors = {
      Male: "#3B82F6",
      Female: "#EC4899",
      Other: "#10B981",
    };

    const formattedActiveGender = activeGenderDistribution.map((item) => ({
      name: item._id,
      value: item.count,
      color: genderColors[item._id] || "#6B7280",
    }));

    const formattedDisabledGender = disabledGenderDistribution.map((item) => ({
      name: item._id,
      value: item.count,
      color: genderColors[item._id] || "#6B7280",
    }));

    // Format age groups
    const ageGroupOrder = [
      "45-55",
      "56-65",
      "66-75",
      "76-85",
      "85+",
      "Unknown",
    ];

    const formattedActiveAge = ageGroupOrder.map((group) => {
      const found = activeAgeGroups.find((item) => item._id === group);
      return {
        ageGroup: group,
        count: found ? found.count : 0,
      };
    });

    const formattedDisabledAge = ageGroupOrder.map((group) => {
      const found = disabledAgeGroups.find((item) => item._id === group);
      return {
        ageGroup: group,
        count: found ? found.count : 0,
      };
    });

    const dashboardData = {
      totalActiveElders: activeElders.length,
      totalDisabledElders: disabledElders.length,
      activeGenderDistribution: formattedActiveGender,
      disabledGenderDistribution: formattedDisabledGender,
      activeAgeGroups: formattedActiveAge,
      disabledAgeGroups: formattedDisabledAge,
      monthlyActiveRegistrations: formattedActiveMonthly,
      monthlyDisabledRegistrations: formattedDisabledMonthly,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Download all elders data as CSV
export const downloadEldersCSV = async (req, res) => {
  try {
    const elders = await Elder.find({})
      .populate("guardian", "name email phoneNumber")
      .populate("caretaker", "name")
      .populate({
        path: "caretaker",
        populate: { path: "staff" },
      })
      .select(
        "fullName dob gender address medicalNotes status isDisabled createdAt updatedAt"
      )
      .lean();

    const csvData = elders.map((elder) => ({
      "Full Name": elder.fullName,
      "Date of Birth": new Date(elder.dob).toLocaleDateString(),
      Age: elder.dob
        ? Math.floor(
            (new Date() - new Date(elder.dob)) / (1000 * 60 * 60 * 24 * 365.25)
          )
        : "Unknown",
      Gender: elder.gender,
      Address: elder.address,
      "Medical Notes": elder.medicalNotes,
      Status: elder.status,
      "Guardian Name": elder.guardian?.name || "N/A",
      "Guardian Email": elder.guardian?.email || "N/A",
      "Caretaker Name": elder.caretaker?.staff?.name || "Not Assigned",
      "Registration Date": new Date(elder.createdAt).toLocaleDateString(),
      "Last Updated": new Date(elder.updatedAt).toLocaleDateString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=elders-data-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error("CSV download error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Download all elders data as PDF
export const downloadEldersPDF = async (req, res) => {
  try {
    const elders = await Elder.find({})
      .populate("guardian", "name email phoneNumber")
      .populate("caretaker", "name")
      .select(
        "fullName dob gender address medicalNotes status isDisabled createdAt"
      )
      .lean();

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=elders-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Elder Care Management Report", { align: "center" });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
    doc.moveDown(2);

    const activeCount = elders.filter(
      (e) => e.status === ElderStatus.ACTIVE
    ).length;
    const disabledCount = elders.filter(
      (e) => e.status === ElderStatus.DISABLED_PENDING_REVIEW
    ).length;

    doc.fontSize(14).text("Summary:", { underline: true });
    doc
      .fontSize(12)
      .text(`Total Elders: ${elders.length}`)
      .text(`Active Elders: ${activeCount}`)
      .text(`Disabled Elders: ${disabledCount}`)
      .moveDown();

    doc.fontSize(14).text("Elder Details:", { underline: true });
    doc.moveDown(0.5);

    elders.forEach((elder, index) => {
      if (index > 0 && index % 10 === 0) {
        doc.addPage();
      }

      const age = elder.dob
        ? Math.floor(
            (new Date() - new Date(elder.dob)) / (1000 * 60 * 60 * 24 * 365.25)
          )
        : "Unknown";

      doc
        .fontSize(11)
        .text(`${index + 1}. ${elder.fullName}`, { continued: true })
        .text(`  (Age: ${age}, Gender: ${elder.gender})`)
        .text(`   Status: ${elder.status}`)
        .text(
          `   Guardian: ${elder.guardian?.name || "N/A"} (${
            elder.guardian?.email || "N/A"
          })`
        )
        .text(`   Address: ${elder.address}`)
        .text(
          `   Registered: ${new Date(elder.createdAt).toLocaleDateString()}`
        )
        .moveDown(0.3);
    });

    doc.end();
  } catch (error) {
    console.error("PDF download error:", error);
    res.status(500).json({ message: error.message });
  }
};