import Event from "../models/event.model.js";
import mongoose from "mongoose";

// ✅ Create Event (Admin only)
export const createEvents = async (req, res) => {
  try {
    const { title, description, start_time, end_time, location } = req.body;

    // Validation
    if (!title || !description || !start_time || !end_time || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newEvent = new Event({ title, description, start_time, end_time, location });
    await newEvent.save();

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error("Error in Create Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Events (Anyone logged in)
export const getAlleEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error in fetching events:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Update Event (Admin only)
export const updateEvents = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid event id" });
  }

  try {
    const updatedEvent = await Event.findById(id);
    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Update only provided fields
    const fields = ["title", "description", "start_time", "end_time", "location"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedEvent[field] = req.body[field];
      }
    });

    await updatedEvent.save(); // keeps validation (end_time > start_time)

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in updating event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Delete Event (Admin only)
export const deleteEvents = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid event id" });
  }

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleting event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
