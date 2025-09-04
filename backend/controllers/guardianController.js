import Guardian from "../models/guardians.js";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.js";

// Helper to create JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token valid for 7 days
  });
};

//register a guardian
export const registerGuardian = async (req, res) => {
  const { name, address, email, phone, username, password } = req.body;

  try {
    // Check if email, username, or phone already exists
    const existing = await Guardian.findOne({ 
      $or: [{ email }, { username }, { phone }] 
    });
    if (existing) {
      return res.status(400).json({ message: "Guardian already exists" });
    }

    const guardian = await Guardian.create({
      name,
      address,
      email,
      phone,
      username,
      password,
    });

    const token = generateToken(guardian._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: guardian._id,
      name: guardian.name,
      email: guardian.email,
      username: guardian.username,
      phone: guardian.phone,
      address: guardian.address,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//login
export const loginGuardian = async (req, res) => {
  const { username, password } = req.body;

  try {
    const guardian = await Guardian.findOne({ username });

    if (!guardian) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await guardian.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(guardian._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      _id: guardian._id,
      name: guardian.name,
      email: guardian.email,
      username: guardian.username,
      phone: guardian.phone,
      address: guardian.address,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//logout
export const logoutGuardian = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};

//get profile
export const getProfile = async (req, res) => {
  try {
    const guardian = req.guardian; // set by auth middleware

    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found" });
    }

    res.json({
      _id: guardian._id,
      name: guardian.name,
      email: guardian.email,
      username: guardian.username,
      phone: guardian.phone,
      address: guardian.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update guardian profile
export const updateProfile = async (req, res) => {
  try {
    const guardian = req.guardian; // comes from auth middleware

    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found" });
    }

    // Update fields if provided
    guardian.name = req.body.name || guardian.name;
    guardian.email = req.body.email || guardian.email;
    guardian.username = req.body.username || guardian.username;
    guardian.phone = req.body.phone || guardian.phone;
    guardian.address = req.body.address || guardian.address;

    // Update password if provided
    if (req.body.password) {
      guardian.password = req.body.password; // make sure your pre-save hook hashes it
    }

    const updatedGuardian = await guardian.save();

    res.json({
      _id: updatedGuardian._id,
      name: updatedGuardian.name,
      email: updatedGuardian.email,
      username: updatedGuardian.username,
      phone: updatedGuardian.phone,
      address: updatedGuardian.address,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitElderRequest = async (req, res) => {
  try {
    const { elderName, dob, gender, medicalNotes } = req.body;
    const guardianId = req.user._id; // From protect middleware (authenticated guardian)

    // Validate required fields
    if (!elderName || !dob || !gender) {
      return res.status(400).json({ message: "Elder name, DOB, and gender are required" });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    // Validate DOB format (basic check)
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    // Handle uploaded files
    const medicalFiles = req.files
      ? req.files.map((file) => ({
          url: file.path, // File path from multer (or S3 URL in production)
          fileName: file.filename,
        }))
      : [];

    // Create new request
    const request = new Request({
      elderName,
      dob: dobDate,
      gender,
      medicalNotes: medicalNotes || "", // Optional field
      medicalFiles,
      guardian: guardianId,
      status: "pending", // Default status
    });

    // Save request to database
    await request.save();

    res.status(201).json({
      message: "Elder request submitted successfully",
      request: {
        elderName,
        dob,
        gender,
        medicalNotes,
        medicalFiles,
        status: request.status,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting elder request:", error);
    res.status(500).json({ message: "Server error while submitting request" });
  }
};



