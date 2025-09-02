import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import guardianRoutes from "./routes/guardianRoutes.js";
import staffRoutes from "./routes/staff_route.js";
import donationsRoutes from "./routes/donationsRoute.js";
import donorListRoutes from "./routes/donorListRoutes.js";


const app = express();
const port = process.env.PORT || 4000;

connectDB();
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); // replace with frontend URL
app.use(express.json());
app.use(cookieParser());


// Routes
app.use("/api/guardians", guardianRoutes);

//staff routes
app.use("/api/staff", staffRoutes);

//donation routes
app.use("/api/donations", donationsRoutes);
app.use("/api/donors", donorListRoutes);



app.get("/", (req, res) => res.send("API working"));

app.listen(port, () => console.log(`Server started on port: ${port}`));
