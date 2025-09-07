// routes/assignment_routes.js
import express from "express";
import { protectStaff } from "../middleware/staffAuth.js";

// room assignment controllers
import {
    getCurrentRoomForElder,
    listAvailableRooms,
    assignRoomToElder,
    unassignRoomFromElder,
} from "../controllers/assignmentRoomController.js";

// meal preference controllers
import {
    listMealCategories,
    listMealsByCategory,
    getElderMealPreferences,
    upsertElderMealPreferences,
} from "../controllers/assignmentMealPrefController.js";

const router = express.Router();

// All endpoints require staff auth
router.use(protectStaff);

/* ------- ROOM ASSIGNMENTS ------- */
// current room for elder
router.get("/rooms/current/:elderId", getCurrentRoomForElder);
// available rooms with filters
router.get("/rooms/available", listAvailableRooms);
// assign a room to elder
router.put("/rooms", assignRoomToElder);            // body: { elderId, room_id }
// unassign elder from their room
router.put("/rooms/unassign", unassignRoomFromElder); // body: { elderId }

/* ------- MEAL ASSIGNMENTS (PREFERENCES) ------- */
// categories for UI
router.get("/meals/categories", listMealCategories);
// meals by category
router.get("/meals/options", listMealsByCategory);
// get + upsert elder preference doc
router.get("/meals/:elderId", getElderMealPreferences);
router.put("/meals/:elderId", upsertElderMealPreferences);

export default router;