
import Event from "../models/event.model.js";
import mongoose from "mongoose";

export const createEvents =async (req, res) => {
  const eventData = req.body; // user will send this data

  // validate required fields
  if (
    !eventData.title ||
    !eventData.description ||
    !eventData.start_time ||
    !eventData.end_time ||
    !eventData.location
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all event fields",
    });
  }

  const newEvent = new Event(eventData);

  try {
    await newEvent.save();
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error("Error in Create Event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const deleteEvents =async (req, res) => {
  
  
  const {id}= req.params
  try {
  await Event.findByIdAndDelete(id);
  res.status(200).json({ success: true, message: "Event deleted" });
} catch (error) {
  console.log("Error in deleting event:", error.message);
  res.status(404).json({ success: false, message: "Event not found" });
}

};


export const getAlleEvents =async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.log("Error in fetching events: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const updateEvents= async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid event id" });
  }

  try {
    // Load the event first
    const updatedEvent = await Event.findById(id);
    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Update only provided fields
    const fields = ["title", "description", "start_time", "end_time", "location"];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updatedEvent[f] = req.body[f];
      }
    }

    // Save with validation (so end_time > start_time still applies)
    await updatedEvent.save();

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error in updating event:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

