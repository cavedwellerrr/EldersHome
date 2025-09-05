import express from "express";
import Staff from "../models/staff_model.js";
import generateToken from "../utils/generateToken.js";
import Doctor from "../models/doctor_model.js";

// Register new staff
export const registerStaff = async (req, res) => {
  const { name, username, email, phone, password, role, specialization } =
    req.body;

  try {
    // Check for duplicate username or email
    const staffExists = await Staff.findOne({
      $or: [{ username }, { email }],
    });
    if (staffExists) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Create staff
    const staff = await Staff.create({
      name,
      username,
      email,
      phone,
      password,
      role,
    });

    // If role is doctor, also create Doctor document
    if (role === "doctor") {
      await Doctor.create({
        staff: staff._id,
        specialization,
      });
    }

    // Generate token
    const token = generateToken(staff._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      username: staff.username,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      specialization: role === "doctor" ? specialization : undefined,
      token,
    });
  } catch (error) {
    console.error("Error registering staff:", error);
    res.status(500).json({ message: "Server error while registering staff" });
  }
};

// Staff login
export const loginStaff = async (req, res) => {
  const { username, password } = req.body;

  try {
    const staff = await Staff.findOne({ username });

    if (staff && (await staff.matchPassword(password))) {
      let specialization;
      if (staff.role === "doctor") {
        const doctor = await Doctor.findOne({ staff: staff._id });
        specialization = doctor?.specialization;
      }

      // Generate token
      const token = generateToken(staff._id);

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        _id: staff._id,
        name: staff.name,
        username: staff.username,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        specialization,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Logout staff
export const logoutStaff = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (staff.role === "doctor") {
      await Doctor.deleteOne({ staff: staff._id });
    }

    await staff.deleteOne();

    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Server error while deleting staff" });
  }
};

// Update staff details
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const { name, username, email, phone, role, password, specialization } =
      req.body;

    if (username || email) {
      const existing = await Staff.findOne({
        $or: [username ? { username } : null, email ? { email } : null].filter(
          Boolean
        ),
        _id: { $ne: staff._id },
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "Username or email already exists" });
      }
    }

    staff.name = name || staff.name;
    staff.username = username || staff.username;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.role = role || staff.role;

    if (password) {
      staff.password = password;
    }

    const updatedStaff = await staff.save();

    if (updatedStaff.role === "doctor") {
      let doctor = await Doctor.findOne({ staff: updatedStaff._id });
      if (doctor) {
        doctor.specialization = specialization || doctor.specialization;
        await doctor.save();
      } else {
        await Doctor.create({
          staff: updatedStaff._id,
          specialization,
        });
      }
    }

    res.json({
      _id: updatedStaff._id,
      name: updatedStaff.name,
      username: updatedStaff.username,
      email: updatedStaff.email,
      phone: updatedStaff.phone,
      role: updatedStaff.role,
      specialization:
        updatedStaff.role === "doctor" ? specialization : undefined,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Server error while updating staff" });
  }
};

export const listCaretakers = async (req, res) => {
  try {
    const caretakers = await Staff.find({ role: "caretaker" });
    res.json(caretakers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
