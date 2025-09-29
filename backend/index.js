// index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import http from "http";
import { Server } from "socket.io";
import chat from "./models/chat.js";

// Guardian routes
import guardianRoutes from "./routes/guardianRoutes.js";
// Staff routes
import staffRoutes from "./routes/staff_route.js";
// Elder route
import elderRoutes from "./routes/elderRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
// Caretaker routes
import caretakerRoutes from "./routes/caretakerRoutes.js";
import caretakerElderRoutes from "./routes/caretaker_elder_routes.js";
import mealRoutes from "./routes/mealRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import assignmentRoutes from "./routes/assignment_routes.js";
// Donation routes
import donationsRoutes from "./routes/donationsRoute.js";
import donorListRoutes from "./routes/donorListRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
// Event routes
import eventRoutes from "./routes/event.route.js";
import eventEnrollmentRoutes from "./routes/eventEnrollments.route.js";
// Health routes
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
const activeDashboards = new Set();
const supportRequests = []; // Store recent support requests (limit to 100)

connectDB();
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/guardians", guardianRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/elders", elderRoutes);
app.use("/api/caretakers", caretakerRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/donors", donorListRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/caretaker/elders", caretakerElderRoutes);
app.use("/api/assign", assignmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-enrollments", eventEnrollmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // --- User joins their room ---
  socket.on("joinChat", ({ userId }) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  // --- Staff dashboard active ---
  socket.on("staffDashboardActive", ({ componentId }) => {
    activeDashboards.add(componentId);
    console.log(`Staff dashboard active: ${componentId}`);
    // Send all stored support requests to the new dashboard
    supportRequests.forEach((request) => {
      socket.emit(`supportRequest-${componentId}`, request);
    });
  });

  // --- Staff dashboard inactive ---
  socket.on("staffDashboardInactive", ({ componentId }) => {
    activeDashboards.delete(componentId);
    console.log(`Staff dashboard inactive: ${componentId}`);
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
        activeSupportUsers.set(userId, true);
      }

      // Forward messages to staff if user is in support mode
      if (activeSupportUsers.get(userId)) {
        const requestData = { userId, message };
        // Store the request
        supportRequests.push(requestData);
        if (supportRequests.length > 100) {
          supportRequests.shift(); // Limit to 100 requests
        }
        // Emit to all active dashboards
        activeDashboards.forEach((componentId) => {
          io.emit(`supportRequest-${componentId}`, requestData);
        });
        // Emit global supportRequest for notifications
        io.emit("supportRequest", requestData);
      }

      // Other bot responses
      if (!activeSupportUsers.get(userId)) {
        if (lowerMsg === "hi" || lowerMsg === "hello") {
          reply = "Hello 👋 Welcome to ElderCare Support! You can ask about:";
          options = ["register", "donation", "support"];
        } else if (lowerMsg.includes("register")) {
          reply =
            "To register, click on the 'Register' button in the top menu.";
        } else if (lowerMsg.includes("donation")) {
          reply =
            "To make a donation, go to 'Donations' → select donation type → click 'Make Donation Now'.";
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
      await chat.create({ userId, sender: "staff", message: reply });
      io.to(`user-${userId}`).emit("staffReply", { reply });
    } catch (error) {
      console.error("Error in staffMessage:", error);
    }
  });

  // --- Message viewed ---
  socket.on("messageViewed", ({ userId }) => {
    io.to(`user-${userId}`).emit("messageViewed");
  });

  // --- End support session ---
  socket.on("endSupport", ({ userId }) => {
    activeSupportUsers.delete(userId);
    // Remove requests for this user
    supportRequests.forEach((request, index) => {
      if (request.userId === userId) {
        supportRequests.splice(index, 1);
      }
    });
    // Notify all dashboards
    activeDashboards.forEach((componentId) => {
      io.emit(`endSupport-${componentId}`, { userId });
    });
    io.to(`user-${userId}`).emit("botReply", {
      reply:
        "Your support session has ended. You can continue chatting with the bot.",
    });
  });

  // --- Disconnect ---
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => res.send("API working"));

server.listen(port, () => console.log(`Server started on port: ${port}`));
