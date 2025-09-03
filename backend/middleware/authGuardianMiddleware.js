import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    const userId = decoded._id || decoded.id;
    if (!userId) {
      return res
        .status(403)
        .json({ message: "Invalid token: User ID missing" });
    }
    req.user = { _id: userId };
    next();
  } catch (error) {
    console.error("Guardian auth error:", error.message, "Token:", token);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { protect };
