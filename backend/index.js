import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import guardianRoutes from "./routes/guardianRoutes.js";
import staffRoutes from "./routes/staff_route.js";
import medicalRecordRoutes from "./routes/medicalRecord_route.js";
import "./models/elder_model.js";
import elderRoutes from "./routes/elder_route.js";
import "./models/doctor_model.js";
import "./models/medicalRecord_model.js";
import caretakerRoutes from "./routes/Caretaker3.route.js";
import consultationRoutes from "./routes/consultation_route.js";




const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // replace with frontend URL

// Routes
app.use("/api/guardians", guardianRoutes);

app.use("/api", elderRoutes);

app.use("/caretakers", caretakerRoutes);

app.use("/api", medicalRecordRoutes);

app.use("/api/staff", staffRoutes);

app.use("/consultations", consultationRoutes);


app.get("/", (req, res) => res.send("API working"));

app.listen(port, () => console.log(`Server started on port: ${port}`));
