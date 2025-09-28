import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import http from "http";
import { Server } from "socket.io";
import chat from "./models/chat.js";

//guardian routes
import guardianRoutes from "./routes/guardianRoutes.js";

//staff routes
import staffRoutes from "./routes/staff_route.js";

//elder route
import elderRoutes from "./routes/elderRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "./middleware/authGuardianMiddleware.js";

//caretaker routes
import caretakerRoutes from "./routes/caretakerRoutes.js";
import caretakerElderRoutes from "./routes/caretaker_elder_routes.js";
import mealRoutes from "./routes/mealRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import assignmentRoutes from "./routes/assignment_routes.js";

//donation routes
import donationsRoutes from "./routes/donationsRoute.js";
import donorListRoutes from "./routes/donorListRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

//event routes
import eventRoutes from "./routes/event.route.js";
import eventEnrollmentRoutes from "./routes/eventEnrollments.route.js";

//health routes
import consultationRoutes from "./routes/consultationRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

// Derive __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

const activeSupportUsers = new Map();

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
app.use("/api/inventory", inventoryRoutes);

//meal routes
app.use("/api/meals", mealRoutes); //meal
app.use("/api/rooms", roomRoutes); //rooms

app.use("/api/caretaker/elders", caretakerElderRoutes);
app.use("/api/assign", assignmentRoutes); //to asiign meal and rooms

//Consultation Routes
app.use("/api/consultations", consultationRoutes);

//event routes
app.use("/api/events", eventRoutes);
app.use("/api/event-enrollments", eventEnrollmentRoutes);

//doctor routes
app.use("/api/doctors", doctorRoutes);

//Appointments Route
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // --- User joins their room ---
  socket.on("joinChat", ({ userId }) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  // --- User message ---
  socket.on("userMessage", async ({ userId, message }) => {
    try {
      console.log(`User ${userId}: ${message}`);

      let reply =
        "Sorry, I didn’t understand. Try 'register', 'booking' or 'support'.";
      let options = [];

      const lowerMsg = message.toLowerCase().trim();

      // Start support session
      if (lowerMsg.includes("support")) {
        reply = "Connecting you to customer support...";
        activeSupportUsers.set(userId, true); // mark user as in support
        io.emit("supportRequest", { userId, message }); // notify staff
      }

      // Forward all messages to staff if user is in support mode
      if (activeSupportUsers.get(userId)) {
        io.emit("supportRequest", { userId, message }); // send every message to staff
      }

      // Other bot responses
      if (!activeSupportUsers.get(userId)) {
        if (lowerMsg === "hi" || lowerMsg === "hello") {
          reply = "Hello 👋 Welcome to ElderCare Support! You can ask about:";
          options = ["register", "booking", "support"];
        } else if (lowerMsg.includes("register")) {
          reply =
            "To register, click on the 'Register' button in the top menu.";
        } else if (lowerMsg.includes("booking")) {
          reply =
            "To book an event, go to 'Events' → select event → click 'Book Now'.";
        }
      }

      // Save messages in DB
      await chat.create({ userId, sender: "user", message });
      await chat.create({ userId, sender: "bot", message: reply });

      // Send bot reply back to user only if not in support mode
      if (!activeSupportUsers.get(userId)) {
        socket.emit("botReply", { reply, options });
      }
    } catch (error) {
      console.error("Error in userMessage:", error);
      socket.emit("botReply", {
        reply: "⚠️ Something went wrong. Try again later.",
      });
    }
  });

  // --- Staff reply ---
  socket.on("staffMessage", async ({ userId, reply }) => {
    try {
      console.log(`Staff reply to ${userId}: ${reply}`);

      // Save in DB
      await chat.create({ userId, sender: "staff", message: reply });

      // Emit reply only to that user's room
      io.to(`user-${userId}`).emit("staffReply", { reply });
    } catch (error) {
      console.error("Error in staffMessage:", error);
    }
  });

  //End support session
  socket.on("endSupport", ({ userId }) => {
    activeSupportUsers.delete(userId);
    io.to(`user-${userId}`).emit("botReply", {
      reply:
        "Your support session has ended. You can continue chatting with the bot.",
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});
app.get("/", (req, res) => res.send("API working"));

server.listen(port, () => console.log(`Server started on port: ${port}`));
