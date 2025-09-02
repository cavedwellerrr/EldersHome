import express from "express";
import mongoose from "mongoose";
import Event from "../models/event.model.js";
import { createEvents, deleteEvents, getAlleEvents, updateEvents } from "../controllers/event.controller.js";

const router= express.Router();


router.post("/",createEvents)


router.delete("/:id",deleteEvents )

router.get("/", getAlleEvents)

router.put("/:id",updateEvents )

export default router;