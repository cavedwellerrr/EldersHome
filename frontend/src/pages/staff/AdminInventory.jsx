import React, { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ itemName: "", totalQuantity: 0 });
  const [updating, setUpdating] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Stats calculation
  const stats = {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
    lowStockItems: inventory.filter(item => item.totalQuantity <= 5).length,
    outOfStockItems: inventory.filter(item => item.totalQuantity === 0).length
  };

  // Filter function
  const getFilteredInventory = useCallback(() => {
    return inventory.filter(item =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const filteredInventory = getFilteredInventory();

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    try {
      const response = await api.get("/inventory");
      setInventory(response.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.response?.data?.message || "Error fetching inventory");
      toast.error(err.response?.data?.message || "Error fetching inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

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
    if (updating.has(editingItem)) return;

    setUpdating(prev => new Set(prev).add(editingItem));

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
      toast.error(error.response?.data?.message || "Failed to update item");
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingItem);
        return newSet;
      });
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ itemName: "", totalQuantity: 0 });
  };

  // Delete item
  const deleteItem = async (id, itemName) => {
    if (!window.confirm(`Delete "${itemName}"? This cannot be undone.`)) {
      return;
    }

    if (updating.has(id) || deleting.has(id)) return;

    setDeleting(prev => new Set(prev).add(id));

    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(item => item._id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.response?.data?.message || "Failed to delete item");
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Download PDF
  const downloadInventoryPDF = () => {
    if (filteredInventory.length === 0) {
      toast.warn("No inventory items to export");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Inventory Report", 14, 20);
      
      // Add summary stats
      doc.setFontSize(12);
      doc.text(`Total Items: ${stats.totalItems}`, 14, 35);
      doc.text(`Total Quantity: ${stats.totalQuantity}`, 14, 42);
      doc.text(`Low Stock Items: ${stats.lowStockItems} (≤ 5 items)`, 14, 49);
      doc.text(`Out of Stock Items: ${stats.outOfStockItems}`, 14, 56);

      const tableColumn = ["#", "Item Name", "Quantity", "Stock Status", "Last Updated"];
      const tableRows = filteredInventory.map((item, index) => [
        index + 1,
        item.itemName,
        item.totalQuantity,
        item.totalQuantity === 0 ? 'Out of Stock' : item.totalQuantity <= 5 ? 'Low Stock' : 'In Stock',
        new Date(item.updatedAt).toLocaleDateString()
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [245, 101, 57], textColor: 255 },
        alternateRowStyles: { fillColor: [255, 247, 237] },
      });

      doc.save("inventory_report.pdf");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error(`Error generating PDF: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError("");
              setLoading(true);
              fetchInventory();
            }}
            className="btn bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <ToastContainer />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7h-3V6a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V6zm9 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h6v1a1 1 0 0 0 2 0V9h2v10z" />
                  </svg>
                </div>
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-2">Track and manage donated items inventory</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7h-3V6a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V6zm9 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h6v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                <p className="text-xs text-gray-500 mt-1">≤ 5 items</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7h-3V6a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V6zm9 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h6v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
                Inventory Items ({filteredInventory.length})
              </h2>
              <p className="text-orange-100 mt-1">Manage donated item quantities</p>
            </div>

            <button
              onClick={downloadInventoryPDF}
              className="btn bg-orange-700 text-white hover:bg-orange-800 border-orange-700 hover:border-orange-800 rounded-lg shadow-lg transition-all duration-200"
            >
              📑 Export PDF
            </button>
          </div>

          {/* Search Control */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full bg-white border-gray-300 focus:border-orange-500 pl-10"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left font-semibold text-gray-700">#</th>
                  <th className="text-left font-semibold text-gray-700">Item Name</th>
                  <th className="text-center font-semibold text-gray-700">Quantity</th>
                  <th className="text-center font-semibold text-gray-700">Stock Status</th>
                  <th className="text-center font-semibold text-gray-700">Last Updated</th>
                  <th className="text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr key={item._id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="font-semibold text-gray-700">{index + 1}</td>
                    <td>
                      {editingItem === item._id ? (
                        <input
                          type="text"
                          value={editForm.itemName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, itemName: e.target.value }))}
                          className="input input-bordered input-sm w-full bg-white border-gray-300 focus:border-orange-500"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {item.itemName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{item.itemName}</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      {editingItem === item._id ? (
                        <input
                          type="number"
                          min="0"
                          value={editForm.totalQuantity}
                          onChange={(e) => setEditForm(prev => ({ ...prev, totalQuantity: parseInt(e.target.value) || 0 }))}
                          className="input input-bordered input-sm w-20 bg-white border-gray-300 focus:border-orange-500 text-center"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">{item.totalQuantity}</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.totalQuantity === 0 
                          ? 'bg-red-100 text-red-700'
                          : item.totalQuantity <= 5 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.totalQuantity === 0 
                          ? 'Out of Stock' 
                          : item.totalQuantity <= 5 
                          ? 'Low Stock' 
                          : 'In Stock'}
                      </span>
                    </td>
                    <td className="text-center text-gray-600 text-sm">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      {editingItem === item._id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={saveEdit}
                            disabled={updating.has(item._id)}
                            className={`btn btn-sm bg-green-100 hover:bg-green-200 text-green-600 border-green-200 hover:border-green-300 rounded-lg transition-all duration-200 ${
                              updating.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {updating.has(item._id) ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => startEdit(item)}
                            disabled={updating.has(item._id) || deleting.has(item._id)}
                            className={`btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 ${
                              updating.has(item._id) || deleting.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item._id, item.itemName)}
                            disabled={updating.has(item._id) || deleting.has(item._id)}
                            className={`btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 ${
                              updating.has(item._id) || deleting.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deleting.has(item._id) ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && inventory.length > 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No items match your search criteria</p>
              <button
                onClick={() => setSearchTerm("")}
                className="btn btn-outline btn-sm mt-3 border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear Search
              </button>
            </div>
          )}

          {inventory.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7h-3V6a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v1H4a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V6zm9 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h6v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No inventory items yet</p>
              <p className="text-gray-400 text-sm mt-2">Items will appear here when item donations are marked as received</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;