// routes/inventoryRoutes.js
import express from "express";
import {
  getInventory,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

// ✅ Fetch all inventory items
router.get("/", getInventory);

// ✅ Update an inventory item (admin only, typically)
router.put("/:id", updateInventoryItem);

// ✅ Delete an inventory item
router.delete("/:id", deleteInventoryItem);

export default router;