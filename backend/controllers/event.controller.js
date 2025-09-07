import Event from "../models/event.model.js";
import mongoose from "mongoose";
import Caretaker from "../models/caretaker_model.js"; // make sure exists
import EventEnrollment from "../models/eventEnrollment.model.js";

// ✅ Create Event (Admin only)
export const createEvents = async (req, res) => {
  try {
    const { title, description, start_time, end_time, location } = req.body;

    if (!title || !description || !start_time || !end_time || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newEvent = new Event({
      title,
      description,
      start_time,
      end_time,
      location,
    });
    await newEvent.save();

    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error("Error in Create Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error in fetching events:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Update Event
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

    const fields = ["title", "description", "start_time", "end_time", "location"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedEvent[field] = req.body[field];
      }
    });

    await updatedEvent.save();
    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in updating event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Delete Event
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

// ✅ Enroll all assigned elders of caretaker
export const enrollAssignedElders = async (req, res) => {
  try {
    const caretakerId = req.user.id; // from JWT middleware
    const { eventId } = req.params;

    const caretaker = await Caretaker.findById(caretakerId).populate("assignedElders");
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    for (const elder of caretaker.assignedElders) {
      const exists = await EventEnrollment.findOne({
        elder: elder._id,
        event: eventId,
      });
      if (!exists) {
        await EventEnrollment.create({
          elder: elder._id,
          event: eventId,
          caretaker: caretakerId,
        });
      }
    }

    res.json({ message: "All assigned elders enrolled into event" });
  } catch (err) {
    console.error("Error enrolling assigned elders:", err);
    res.status(500).json({ message: err.message || "Failed to enroll elders" });
  }
};