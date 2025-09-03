import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Use raw collection since no user_model.js
const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true },
    },
    { collection: "users" }
  ),
  "users"
);

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Replace with bcrypt.compare in production
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.role) {
      return res
        .status(403)
        .json({ message: "User role is missing. Please contact support." });
    }
    if (user.role !== "guardian") {
      return res.status(403).json({
        message: `Access denied: User role is ${user.role}, guardian required`,
      });
    }
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("Generated token payload:", {
      _id: user._id.toString(),
      role: user.role,
    });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
