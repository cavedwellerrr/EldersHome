import jwt from "jsonwebtoken";

const generateToken = (staff) => {
  return jwt.sign(
    {
      id: staff._id,
      role: staff.role,
    },
    process.env.JWT_SECRET2,
    { expiresIn: "1d" }
  );
};

export default generateToken;
