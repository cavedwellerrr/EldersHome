import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import guardianRoutes from "./routes/guardianRoutes.js";
import staffRoutes from "./routes/staff_route.js";

import mealRoutes from "./routes/mealRoutes.js"

const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // replace with frontend URL

// Routes
app.use("/api/guardians", guardianRoutes);

app.use("/api/staff", staffRoutes);
app.use("/api/meals", mealRoutes);//meal

app.get("/", (req, res) => res.send("API working"));

app.listen(port, () => console.log(`Server started on port: ${port}`));
