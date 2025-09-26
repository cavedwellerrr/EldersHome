import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ itemName: "", totalQuantity: 0 });

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Start editing an item
  const startEdit = (item) => {
    setEditingItem(item._id);
    setEditForm({
      itemName: item.itemName,
      totalQuantity: item.totalQuantity
    });
  };

  // Save edited item
  const saveEdit = async () => {
    try {
      const response = await api.put(`/inventory/${editingItem}`, editForm);
      
      // Update local state
      setInventory(prev => 
        prev.map(item => 
          item._id === editingItem ? response.data : item
        )
      );
      
      setEditingItem(null);
      setEditForm({ itemName: "", totalQuantity: 0 });
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ itemName: "", totalQuantity: 0 });
  };

  // Delete item
  const deleteItem = async (id, itemName) => {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(item => item._id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return <div className="p-4">Loading inventory...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      
      {inventory.length === 0 ? (
        <p>No inventory items yet. Items will appear when donations are marked as received.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Last Updated</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {editingItem === item._id ? (
                      <input
                        type="text"
                        value={editForm.itemName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, itemName: e.target.value }))}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      item.itemName
                    )}
                  </td>
                  
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {editingItem === item._id ? (
                      <input
                        type="number"
                        min="0"
                        value={editForm.totalQuantity}
                        onChange={(e) => setEditForm(prev => ({ ...prev, totalQuantity: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                    ) : (
                      item.totalQuantity
                    )}
                  </td>
                  
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {editingItem === item._id ? (
                      <div className="space-x-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item._id, item.itemName)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;