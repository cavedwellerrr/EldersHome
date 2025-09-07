import express from "express";
import { getRooms, addRoom, deleteRoom, updateRoom, } from "../controllers/roomController.js";

const router = express.Router();


router.get("/", getRooms);          // read   /api/rooms
router.post("/", addRoom);          // create   /api/rooms
router.delete("/:id", deleteRoom);  // remove /api/rooms/:id
router.put("/:id", updateRoom);     // update    /api/rooms/:id

export default router;