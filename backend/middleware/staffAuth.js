// backend/middleware/staffAuth.js
import jwt from "jsonwebtoken";
import Staff from "../models/staff_model.js"; // adjust path if different

// ✅ Check if staff is logged in
export const protectStaff = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach staff user to request
      req.staff = await Staff.findById(decoded.id).select("-password");

      if (!req.staff) {
        return res.status(401).json({ message: "Staff not found" });
      }

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ✅ Check if logged-in staff is Operator
export const requireOperator = (req, res, next) => {
  if (req.staff && req.staff.role === "operator") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied: Operator role required" });
  }
};
