import jwt from "jsonwebtoken";
import Guardian from "../models/guardians.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach guardian to req object
      req.guardian = await Guardian.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};
