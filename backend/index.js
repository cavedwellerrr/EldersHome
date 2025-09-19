import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import guardianRoutes from "./routes/guardianRoutes.js";
import staffRoutes from "./routes/staff_route.js";
import elderRoutes from "./routes/elderRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "./middleware/authGuardianMiddleware.js";
import caretakerRoutes from "./routes/caretakerRoutes.js";
import donationsRoutes from "./routes/donationsRoute.js";
import donorListRoutes from "./routes/donorListRoutes.js";
import caretakerElderRoutes from "./routes/caretaker_elder_routes.js";

import mealRoutes from "./routes/mealRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import assignmentRoutes from "./routes/assignment_routes.js";

import eventRoutes from "./routes/event.route.js";
import eventEnrollmentRoutes from "./routes/eventEnrollments.route.js";

import consultationRoutes from "./routes/consultationRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";




// Derive __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

connectDB();
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // replace with frontend URL
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use("/api/guardians", guardianRoutes);

//staff routes
app.use("/api/staff", staffRoutes);
app.use("/api/elders", elderRoutes);
app.use("/api/caretakers", caretakerRoutes);

//donation routes
app.use("/api/donations", donationsRoutes);
app.use("/api/donors", donorListRoutes);

//meal routes
app.use("/api/meals", mealRoutes);//meal
app.use("/api/rooms", roomRoutes);//rooms

app.use("/api/caretaker/elders", caretakerElderRoutes);
app.use("/api/assign", assignmentRoutes);//to asiign meal and rooms

//Consultation Routes
app.use("/api/consultations", consultationRoutes);

//event routes
app.use("/api/events", eventRoutes);
app.use("/api/event-enrollments", eventEnrollmentRoutes);

//doctor routes
app.use("/api/doctors", doctorRoutes);

//Appointments Route
app.use("/api/appointments", appointmentRoutes);



app.get("/", (req, res) => res.send("API working"));

app.listen(port, () => console.log(`Server started on port: ${port}`));
