import express from "express";
import { addMeal, deleteMeal, getMeals, updateMeal } from "../controllers/mealController.js";

const router = express.Router();

// MEAL PREFERENCES
router.get("/", getMeals);      // GET  /api/meals
router.post("/", addMeal);      // POST /api/meals
router.delete("/:id", deleteMeal); // DELETE /api/meals/:id
router.put("/:id", updateMeal);    // PUT    /api/meals/:id

export default router;