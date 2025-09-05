import Elder from "../models/elder_model.js";

// Get all elders
export const getAllElders = async (req, res) => {
  try {
    const elders = await Elder.find()
      .populate("caretaker", "name")   // caretakers use "name"
      .populate("guardian", "name");   // guardians use "name"
    res.json(elders);
  } catch (error) {
    console.error("Error fetching elders:", error);
    res.status(500).json({ message: "Error fetching elders" });
  }
};

// Get elders assigned to a specific caretaker
export const getEldersByCaretaker = async (req, res) => {
  try {
    const { caretakerId } = req.params;
    const elders = await Elder.find({ caretaker: caretakerId })
      .populate("guardian", "name ");
    res.json(elders);
  } catch (error) {
    console.error("Error fetching caretaker elders:", error);
    res.status(500).json({ message: "Error fetching caretaker elders" });
  }
};

// Search elders by name
export const getElderByName = async (req, res) => {
  try {
    const nameQuery = req.query.name; // /elders/search/by-name?name=Silva
    if (!nameQuery) {
      return res.status(400).json({ message: "Name query is required" });
    }

    // Case-insensitive search using regex
    const elders = await Elder.find({
      fullName: { $regex: nameQuery, $options: "i" }
    })
      .populate("caretaker", "fullname ")
      .populate("guardian", "fullname ");

    if (elders.length === 0) {
      return res.status(404).json({ message: "No elders found with that name" });
    }

    res.json(elders);
  } catch (error) {
    console.error("Error searching elder by name:", error);
    res.status(500).json({ message: "Error searching elder by name" });
  }
};
