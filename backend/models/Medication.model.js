
import mongoose from "mongoose";


const medicationSchema = new mongoose.Schema(
  {
    
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Elder", 
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },


    drug: {
      type: String,
      required: true,
      trim: true,
    },

 
    dosage: {
      type: String,
      required: true,
    },

  
    freqPerDay: {
      type: Number,
      required: true,
      min: 1,
    },


    startDate: {
      type: Date,
      required: true,
    },

 
    endDate: {
      type: Date,
      required: true,
    },


    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);


const Medication = mongoose.model("Medication", medicationSchema);

export default Medication;
