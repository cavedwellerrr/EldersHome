import Caretaker from "../models/caretaker_model.js";

// Get all caretakers
export const getAllCaretakers = async (req, res) => {
  try {
    const caretakers = await Caretaker.find()
      .populate("staff", "name") // populate staff name
      .populate("assignedElders", "name"); // populate elder names
    res.json(caretakers);
  } catch (error) {
    console.error("Error fetching caretakers:", error);
    res.status(500).json({ message: "Error fetching caretakers" });
  }
};

// Get one caretaker by ID
export const getCaretakerById = async (req, res) => {
  try {
    const { caretakerId } = req.params;
    const caretaker = await Caretaker.findById(caretakerId)
      .populate("staff", "name")
      .populate("assignedElders", "name");

    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    res.json(caretaker);
  } catch (error) {
    console.error("Error fetching caretaker:", error);
    res.status(500).json({ message: "Error fetching caretaker" });
  }
};

// Get assigned elders for a caretaker
export const getAssignedElders = async (req, res) => {
  try {
    const { caretakerId } = req.params;

    const caretaker = await Caretaker.findById(caretakerId).populate(
      "assignedElders",
      "name"
    );

    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    res.json(caretaker.assignedElders || []);
  } catch (error) {
    console.error("Error fetching assigned elders:", error);
    res.status(500).json({ message: "Error fetching assigned elders" });
  }
};

// Assign elders to a caretaker
export const assignEldersToCaretaker = async (req, res) => {
  try {
    const { caretakerId } = req.params;
    const { elderIds } = req.body; // expects array of elder IDs

    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    caretaker.assignedElders = [...new Set([...caretaker.assignedElders, ...elderIds])]; // avoid duplicates
    await caretaker.save();

    const updated = await caretaker.populate("assignedElders", "name");
    res.json(updated.assignedElders);
  } catch (error) {
    console.error("Error assigning elders:", error);
    res.status(500).json({ message: "Error assigning elders" });
  }
};
