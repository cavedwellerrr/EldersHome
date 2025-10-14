import Inventory from "../models/inventory_model.js";
import Donation from "../models/donations.js";

// Add or update inventory when donation status changes to received
export const addDonationToInventory = async (donationId) => {
  try {
    const donation = await Donation.findById(donationId);
    if (!donation || donation.donationType !== "item" || donation.status !== "received") {
      return; // not an item donation OR not received yet
    }

    const { itemName, quantity } = donation;

    // Find existing item
    let inventoryItem = await Inventory.findOne({ itemName });

    if (inventoryItem) {
      // Update existing quantity
      inventoryItem.totalQuantity += quantity;
      await inventoryItem.save();
    } else {
      // Create new entry
      inventoryItem = await Inventory.create({
        itemName,
        totalQuantity: quantity,
      });
    }

    console.log(`Inventory updated for item: ${itemName}, qty: ${quantity}`);
  } catch (error) {
    console.error("Error adding donation to inventory:", error);
  }
};

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ updatedAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error while fetching inventory" });
  }
};

// Update inventory manually (admin edit)
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, totalQuantity } = req.body;

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { itemName, totalQuantity },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Server error while updating inventory" });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ message: "Server error while deleting inventory" });
  }
};