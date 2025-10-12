// index.js (Updated Backend)
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import http from "http";
import { Server } from "socket.io";
import chat from "./models/chat.js";
import botMessages from "./utils/botMessages.js";

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
import mealPreferenceRoutes from "./routes/mealPreference_routes.js";

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

const activeSupportUsers = new Map(); // userId => startTime (Date)
const activeDashboards = new Set();
const supportRequests = new Map(); // userId => array of {sender, message, createdAt}

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
app.use("/api/meal-preferences", mealPreferenceRoutes);
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
  console.log("New client connected:", socket.id);

  // --- Staff dashboard active ---
  socket.on("staffDashboardActive", ({ componentId }) => {
    activeDashboards.add(componentId);
    console.log(`Staff dashboard active: ${componentId}`);
    // Send active users and their latest messages
    const activeUsers = Array.from(activeSupportUsers.keys()).map((userId) => ({
      userId,
      lastMessage: supportRequests.get(userId)?.slice(-1)[0] || { message: "" },
    }));
    socket.emit(`activeSupports-${componentId}`, { activeUsers });
  });

  // --- Staff dashboard inactive ---
  socket.on("staffDashboardInactive", ({ componentId }) => {
    activeDashboards.delete(componentId);
    console.log(`Staff dashboard inactive: ${componentId}`);
  });

  // --- Fetch chat history for a user ---
  socket.on("fetchChatHistory", async ({ userId }) => {
    try {
      const startTime = activeSupportUsers.get(userId) || new Date(0);
      const history = await chat
        .find({ userId, createdAt: { $gte: startTime } })
        .sort({ createdAt: 1 })
        .lean();
      socket.emit("chatHistory", { userId, history });
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

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
        "Sorry, I didn’t understand. Try 'register', 'donation' or 'support'.";
      let options = [];

      const lowerMsg = message.toLowerCase().trim();

      // Start support session
      if (lowerMsg.includes("support")) {
        reply = "Connecting you to customer support...";
        activeSupportUsers.set(userId, new Date());
        supportRequests.set(userId, []);
      }

      // Forward all messages to staff if user is in support mode
      if (activeSupportUsers.has(userId)) {
        const requestData = { sender: "user", message, createdAt: new Date() };
        supportRequests.get(userId).push(requestData);
        // Broadcast to all active dashboards
        activeDashboards.forEach((componentId) => {
          io.emit(`supportRequest-${componentId}`, { userId, ...requestData });
        });
        // Emit global for notifications
        io.emit("supportRequest", { userId, message });
      }

      // Other bot responses
      if (!activeSupportUsers.has(userId)) {
        if (lowerMsg === "hi" || lowerMsg === "hello") {
          reply = botMessages.welcome;
          options = ["register", "donation", "support"];
        } else if (lowerMsg.includes("register")) {
          reply = botMessages.elderRegistration;
        } else if (lowerMsg.includes("donation")) {
          reply = botMessages.donation;
        }
      }

      // Save messages in DB
      await chat.create({ userId, sender: "user", message });
      await chat.create({ userId, sender: "bot", message: reply });

      // Send bot reply back to user only if not in support mode
      if (!activeSupportUsers.has(userId)) {
        socket.emit("botReply", { reply, options });
      }
    } catch (error) {
      console.error("Error in userMessage:", error);
      socket.emit("botReply", {
        reply: "Something went wrong. Try again later.",
      });
    }
  });

  // --- Staff reply ---
  socket.on("staffMessage", async ({ userId, reply }) => {
    try {
      console.log(`Staff reply to ${userId}: ${reply}`);

      // Save in DB
      const messageData = {
        sender: "staff",
        message: reply,
        createdAt: new Date(),
      };
      await chat.create({ userId, sender: "staff", message: reply });

      // Add to supportRequests for history
      if (supportRequests.has(userId)) {
        supportRequests.get(userId).push(messageData);
      }

      // Emit reply only to that user's room
      io.to(`user-${userId}`).emit("staffReply", { reply });

      // Broadcast to all active dashboards
      activeDashboards.forEach((componentId) => {
        io.emit(`staffReply-${componentId}`, { userId, ...messageData });
      });
    } catch (error) {
      console.error("Error in staffMessage:", error);
    }
  });

  // --- Message viewed ---
  socket.on("messageViewed", ({ userId }) => {
    io.to(`user-${userId}`).emit("messageViewed");
  });

  //End support session
  socket.on("endSupport", ({ userId }) => {
    activeSupportUsers.delete(userId);
    supportRequests.delete(userId);
    // Notify all dashboards
    activeDashboards.forEach((componentId) => {
      io.emit(`endSupport-${componentId}`, { userId });
    });
    io.to(`user-${userId}`).emit("botReply", {
      reply:
        "Your support session has ended. You can continue chatting with the bot.",
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
app.get("/", (req, res) => res.send("API working"));

server.listen(port, () => console.log(`Server started on port: ${port}`));
