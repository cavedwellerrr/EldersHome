import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true,     // removes extra spaces
  },
  description: {
    type: String,
    required: true,
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v > this.start_time; // end_time must be after start_time
      },
      message: "End time must be after start time",
    },
  },
  location: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // adds createdAt & updatedAt automatically
});

const Event = mongoose.model('Event', eventSchema);

export default Event;