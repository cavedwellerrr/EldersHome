import mongoose from "mongoose";

const financialSummarySchema = new mongoose.Schema({
  totalCashReceived: { type: Number, default: 0 },
  totalDonationsCount: { type: Number, default: 0 },
  totalCashDonationsCount: { type: Number, default: 0 },
  totalItemDonationsCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  // Optional: track by month/year for reports
  monthlyBreakdown: [{
    month: String, // Format: "YYYY-MM"
    cashReceived: { type: Number, default: 0 },
    donationsCount: { type: Number, default: 0 }
  }]
});

const FinancialSummary = mongoose.model("FinancialSummary", financialSummarySchema);
export default FinancialSummary;