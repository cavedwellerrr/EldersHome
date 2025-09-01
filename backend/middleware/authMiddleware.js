import Staff from "../models/staff_model.js";

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const staff = await Staff.findById(decoded.id);

      if (!staff || staff.role !== "Admin") {
        return res.status(401).json({ message: "Not authorized as Admin" });
      }

      req.staff = staff;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};
