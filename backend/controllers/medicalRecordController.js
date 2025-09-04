import MedicalRecord from "../models/medicalRecord_model.js";

//  Add
export const addMedicalRecord = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { doctorId, recordType, notes } = req.body;  //  take doctorId from body

    if (!doctorId || !elderId) {
      return res.status(400).json({ message: "Both elderId and doctorId are required" });
    }

    const record = await MedicalRecord.create({
      elderId,
      doctorId,
      recordType,
      notes,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Error adding record:", error);
    res.status(500).json({ message: "Error adding record" });
  }
};


//  Get all
export const getAllMedicalRecords = async (req, res) => {
  try {
    console.log(" Fetching medical records...");

    const records = await MedicalRecord.find()
      .populate("elderId")
      .populate("doctorId");

    console.log(" Records fetched:", records);

    res.json(records);
  } catch (error) {
    console.error(" Error fetching records:", error.message);
    res.status(500).json({ message: "Error fetching records", error: error.message });
  }
};


//  Update
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { recordType, notes } = req.body;

    const record = await MedicalRecord.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    record.recordType = recordType || record.recordType;
    record.notes = notes || record.notes;

    const updated = await record.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating record" });
  }
};

//  Delete
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    await record.deleteOne();
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting record" });
  }
};
