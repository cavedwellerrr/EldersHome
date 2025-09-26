
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";


const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ itemName: "", totalQuantity: 0 });

  const [updating, setUpdating] = useState(new Set()); // Track which items are being updated
  const [deleting, setDeleting] = useState(new Set()); // Track which items are being deleted
  const [searchTerm, setSearchTerm] = useState("");
  const intervalRef = useRef(null);

  // Filter function
  const getFilteredInventory = useCallback(() => {
    return inventory.filter(item => 
      !searchTerm || 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())

    );
  }, [inventory, searchTerm]);

  const filteredInventory = getFilteredInventory();

  // Fetch inventory

  const fetchInventory = useCallback(async (showToast = false) => {
    try {
      const response = await api.get("/inventory");
      setInventory(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching inventory:", err);
      if (!showToast) { // Only show error toast on initial load
        setError(err.response?.data?.message || "Error fetching inventory");
        toast.error(err.response?.data?.message || "Error fetching inventory");
      }

    } finally {
      if (!showToast) { // Only set loading false on initial load
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {

    // Initial fetch
    fetchInventory(false);

    // Set up polling every 60 seconds for inventory
    intervalRef.current = setInterval(() => {
      fetchInventory(true);
    }, 60000);

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

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

    if (updating.has(editingItem)) return; // Prevent duplicate requests

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

    } catch (err) {
      console.error("Error updating item:", err);
      toast.error(err.response?.data?.message || "Failed to update item");

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


    if (updating.has(id) || deleting.has(id)) return; // Prevent duplicate requests


    setDeleting(prev => new Set(prev).add(id));

    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(item => item._id !== id));
      toast.success("Item deleted successfully");

    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error(err.response?.data?.message || "Failed to delete item");

    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });


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

              fetchInventory(false);

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

                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />

                  </svg>
                </div>
                Inventory Management
              </h1>

              <p className="text-gray-600 mt-2">Track and manage donated items in stock</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Live Updates</span>

            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>

                <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />

                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>

                <p className="text-3xl font-bold text-green-600">
                  {inventory.reduce((sum, item) => sum + item.totalQuantity, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,4V2C7,1.45 7.45,1 8,1H16C16.55,1 17,1.45 17,2V4H20V6H19V19C19,20.1 18.1,21 17,21H7C5.9,21 5,20.1 5,19V6H4V4H7M9,3V4H15V3H9M7,6V19H17V6H7Z" />

                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>

                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-orange-600">
                  {inventory.filter(item => item.totalQuantity <= 5).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">≤ 5 quantity</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />

                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
              </svg>
              Inventory Items ({filteredInventory.length})
            </h2>
            <p className="text-orange-100 mt-1">Manage your donated items stock</p>
          </div>

          {/* Search Controls */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No inventory items yet</p>
              <p className="text-gray-400 text-sm mt-2">Items will appear when donations are marked as received</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-gray-50">
                    <tr>
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
                        <td className="font-medium text-gray-900">
                          {editingItem === item._id ? (
                            <input
                              type="text"
                              value={editForm.itemName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, itemName: e.target.value }))}
                              className="input input-bordered w-full bg-white border-gray-300 focus:border-orange-500"
                              disabled={updating.has(item._id)}
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {item.itemName.charAt(0).toUpperCase()}
                              </div>
                              <span>{item.itemName}</span>
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
                              className="input input-bordered w-20 text-center bg-white border-gray-300 focus:border-orange-500"
                              disabled={updating.has(item._id)}
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
                            <div className="flex justify-center gap-2">
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
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={updating.has(item._id)}
                                className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => startEdit(item)}
                                disabled={updating.has(item._id) || deleting.has(item._id)}
                                className={`btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 ${
                                  updating.has(item._id) || deleting.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Edit item"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteItem(item._id, item.itemName)}
                                disabled={updating.has(item._id) || deleting.has(item._id)}
                                className={`btn btn-sm bg-red-100 hover:bg-red-200 text-red-600 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 ${
                                  updating.has(item._id) || deleting.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Delete item"
                              >
                                {deleting.has(item._id) ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                  </svg>
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
                  <p className="text-gray-500 text-lg">No items match your search</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="btn btn-outline btn-sm mt-3 border-gray-300 hover:bg-gray-100 text-gray-600"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>

          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;