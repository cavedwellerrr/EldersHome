import jwt from "jsonwebtoken";
import Staff from "../models/staff_model.js";

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Get token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const staff = await Staff.findById(decoded.id).select("-password");

      if (!staff || staff.role !== "admin") {
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      req.staff = staff;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Token is not valid" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};
