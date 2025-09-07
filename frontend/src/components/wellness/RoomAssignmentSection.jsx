// src/components/staff/RoomAssignmentSection.jsx
import { useEffect, useState } from "react";
import { AlertTriangle, Home } from "lucide-react";
import api from "../../api";

export default function RoomAssignmentSection({ elderId, currentRoom, onChanged }) {
    const token = localStorage.getItem("staffToken");
    const [filters, setFilters] = useState({ floor: "", type: "", q: "" });
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSelection, setShowSelection] = useState(false);

    const FLOORS = ["Ground", "1", "2", "3"];
    const TYPES = ["AC", "Non-AC"];

    const loadAvailable = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.floor) params.set("floor", filters.floor);
            if (filters.type) params.set("type", filters.type);
            if (filters.q) params.set("q", filters.q);
            const res = await api.get(`/assign/rooms/available?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRooms(res.data?.rooms || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showSelection) {
            loadAvailable();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showSelection]);

    const assign = async (room_id) => {
        try {
            await api.put(
                `/assign/rooms`,
                { elderId, room_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onChanged?.();
            setShowSelection(false);
        } catch (e) {
            alert(e?.response?.data?.message || e.message || "Failed to assign room");
        }
    };

    const unassign = async () => {
        try {
            await api.put(
                `/assign/rooms/unassign`,
                { elderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onChanged?.();
        } catch (e) {
            alert(e?.response?.data?.message || e.message || "Failed to unassign room");
        }
    };

    return (
        <div className="space-y-4">
            {/* Current Room Status */}
            <div className="border border-orange-100 rounded-lg p-4 bg-white shadow-lg">
                {currentRoom ? (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">Currently Assigned</h4>
                            <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Room</div>
                                    <div className="font-bold text-lg text-orange-600">{currentRoom.room_id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Floor</div>
                                    <div className="font-semibold text-gray-900">{currentRoom.floor}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Type</div>
                                    <div className="font-semibold text-gray-900">{currentRoom.type}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                                    <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        {currentRoom.status}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="bg-red-500 text-white hover:bg-red-600 border-2 border-red-500 hover:border-red-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                    onClick={unassign}
                                >
                                    Unassign Room
                                </button>
                                <button
                                    className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => setShowSelection(true)}
                                >
                                    Change Room
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center w-full py-6">
                        <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-semibold mb-2 text-gray-900">No Room Assigned</h4>
                        <p className="text-gray-600 mb-4">This elder hasn't been assigned to a room yet.</p>
                        <button
                            className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() => setShowSelection(true)}
                        >
                            Assign a Room
                        </button>
                    </div>
                )}
            </div>

            {/* Room Selection */}
            {showSelection && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <h5 className="font-medium text-gray-900 mb-3">Filter Available Rooms</h5>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                                className="select select-bordered select-sm"
                                value={filters.floor}
                                onChange={(e) => setFilters((p) => ({ ...p, floor: e.target.value }))}
                            >
                                <option value="">Any floor</option>
                                {FLOORS.map((f) => (
                                    <option key={f} value={f}>
                                        Floor {f}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="select select-bordered select-sm"
                                value={filters.type}
                                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                            >
                                <option value="">Any type</option>
                                {TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="input input-bordered input-sm"
                                value={filters.q}
                                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                                placeholder="Search room ID"
                            />
                            <button
                                className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-500 hover:border-orange-600 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={loadAvailable}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="bg-white rounded-lg shadow-lg border border-orange-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <span className="loading loading-spinner loading-md text-orange-500"></span>
                                <p className="text-gray-600 mt-4">Loading available rooms...</p>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="p-8 text-center">
                                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No available rooms match your criteria.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="bg-orange-50 p-4 border-b border-orange-200">
                                    <h5 className="font-medium text-gray-900">Available Rooms ({rooms.length})</h5>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Room</th>
                                                <th>Floor</th>
                                                <th>Type</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rooms.map((r) => (
                                                <tr key={r.room_id} className="hover:bg-gray-50">
                                                    <td className="font-bold text-orange-600">{r.room_id}</td>
                                                    <td>{r.floor}</td>
                                                    <td>
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                                            {r.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="bg-green-500 text-white hover:bg-green-600 border-2 border-green-500 hover:border-green-600 px-3 py-1 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                                            onClick={() => assign(r.room_id)}
                                                        >
                                                            Assign
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            className="bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                            onClick={() => setShowSelection(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
