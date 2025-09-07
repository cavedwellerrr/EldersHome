import mongoose from "mongoose";
import Event from "../models/event.model.js";
import express from "express";
import {
  createEvents,
  deleteEvents,
  getAllEvents,
  updateEvents,
} from "../controllers/event.controller.js";


const router = express.Router();

// 🔒 Admin protected routes
router.get("/",  getAllEvents);
router.post("/",  createEvents);
router.put("/:id",  updateEvents);
router.delete("/:id", deleteEvents);

export default router;