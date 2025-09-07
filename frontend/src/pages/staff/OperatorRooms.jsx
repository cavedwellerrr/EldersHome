import React, { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api.js";
import RoomFormModal from "../../components/wellness/RoomFormModal.jsx";
import ConfirmDialog from "../../components/wellness/ConfirmDialog.jsx";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

const FLOOR_OPTIONS = ["Ground", "1", "2", "3"];
const TYPE_OPTIONS = ["AC", "Non-AC"];
const STATUS_OPTIONS = ["available", "maintenance", "reserved", "occupied"]; // occupied is blocked in CRUD by backend

function StatusBadge({ value }) {
    const map = {
        available: "bg-green-50 text-green-700 border-green-200",
        maintenance: "bg-orange-50 text-orange-700 border-orange-200",
        reserved: "bg-blue-50 text-blue-700 border-blue-200",
        occupied: "bg-red-50 text-red-700 border-red-200",
    };
    const cls = map[value] || "bg-gray-100 text-gray-700 border-gray-200";
    return (
        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${cls}`}>
            {value}
        </span>
    );
}

export default function OperatorRooms() {
    const [allRooms, setAllRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ floor: "", type: "", status: "", q: "" });

    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null, room_id: "" });

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const { floor, type, status, q } = filters;
            const params = {};
            if (floor) params.floor = floor;
            if (type) params.type = type;
            if (status) params.status = status;
            if (q) params.q = q;
            const { data } = await api.get("/rooms", { params });
            setAllRooms(data?.data || []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearch = (e) => {
        e.preventDefault();
        fetchRooms();
    };

    const resetFilters = () => setFilters({ floor: "", type: "", status: "", q: "" });

    const openAdd = () => {
        setEditing(null);
        setOpenForm(true);
    };
    const openEdit = (room) => {
        setEditing(room);
        setOpenForm(true);
    };
    const afterSave = () => {
        setOpenForm(false);
        setEditing(null);
        fetchRooms();
    };
    const askDelete = (room) => setConfirm({ open: true, id: room._id, room_id: room.room_id });

    const doDelete = async () => {
        try {
            await api.delete(`/rooms/${confirm.id}`);
            toast.success("Room deleted");
            setConfirm({ open: false, id: null, room_id: "" });
            fetchRooms();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }
    };

    // client-side filter (snappy)
    const viewRooms = useMemo(() => {
        let arr = allRooms;
        if (filters.floor) {
            const want = String(filters.floor).toLowerCase();
            arr = arr.filter((r) => String(r.floor || "").toLowerCase() === want);
        }
        if (filters.type) arr = arr.filter((r) => (r.type || "") === filters.type);
        if (filters.status) arr = arr.filter((r) => (r.status || "") === filters.status);
        if (filters.q) {
            const q = filters.q.trim().toLowerCase();
            arr = arr.filter((r) => String(r.room_id || "").toLowerCase().includes(q));
        }
        return arr;
    }, [allRooms, filters]);

    const empty = !loading && viewRooms.length === 0;
    const total = viewRooms.length;

    const subtitle = useMemo(() => {
        const parts = [];
        if (filters.floor) parts.push(`Floor: ${filters.floor}`);
        if (filters.type) parts.push(`Type: ${filters.type}`);
        if (filters.status) parts.push(`Status: ${filters.status}`);
        if (filters.q) parts.push(`Search: "${filters.q}"`);
        return parts.join(" • ");
    }, [filters]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
            <div className="max-w-7xl mx-auto p-6 lg:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 lg:p-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    Room Management
                                </h1>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                                    <p className="text-gray-600 font-medium">
                                        {total} room{total !== 1 ? "s" : ""} found{subtitle ? ` • ${subtitle}` : ""}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 active:scale-[.98] transition-all duration-200"
                                onClick={openAdd}
                            >
                                <Plus className="size-5" />
                                <span className="hidden sm:inline">Add New Room</span>
                                <span className="sm:hidden">Add Room</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Search className="w-4 h-4 text-orange-600" />
                            </div>
                            Filter & Search Rooms
                        </h2>
                        <form onSubmit={onSearch}>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="relative">
                                    <select
                                        className="w-full rounded-xl border-2 border-orange-200 bg-white py-3 px-4 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-gray-900"
                                        value={filters.floor}
                                        onChange={(e) => setFilters((f) => ({ ...f, floor: e.target.value }))}
                                    >
                                        <option value="">All Floors</option>
                                        {FLOOR_OPTIONS.map((f) => (
                                            <option key={f} value={f}>Floor {f}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <select
                                        className="w-full rounded-xl border-2 border-orange-200 bg-white py-3 px-4 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-gray-900"
                                        value={filters.type}
                                        onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                                    >
                                        <option value="">All Types</option>
                                        {TYPE_OPTIONS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <select
                                        className="w-full rounded-xl border-2 border-orange-200 bg-white py-3 px-4 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 text-gray-900"
                                        value={filters.status}
                                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                                    >
                                        <option value="">All Status</option>
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white shadow-sm text-gray-900 placeholder-gray-500"
                                        placeholder="Search by Room ID..."
                                        value={filters.q}
                                        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                                        type="submit"
                                    >
                                        Search
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-3 rounded-xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 font-medium"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Rooms Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Search className="w-4 h-4" />
                            </div>
                            Room Directory
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-orange-100">
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        #
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Room ID
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Floor
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Type
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Last Updated
                                    </th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold tracking-wider uppercase text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-orange-100">
                                {loading && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                                    <span className="text-gray-600 font-medium">Loading rooms...</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && viewRooms.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">
                                                <div className="flex flex-col items-center space-y-4">
                                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <Search className="h-8 w-8 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
                                                        <p className="text-gray-600">
                                                            Try different filters or add a new room to get started.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    viewRooms.map((r, idx) => (
                                        <tr key={r._id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-white cursor-pointer transition-all duration-200 group">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {r.room_id?.charAt(0) || "R"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{r.room_id}</div>
                                                        <div className="text-sm text-gray-500">Room #{idx + 1}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg flex items-center justify-center min-w-fit">
                                                        <span className="text-gray-800 font-bold text-sm whitespace-nowrap">{r.floor}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                                    {r.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <StatusBadge value={r.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(r.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="rounded-lg px-3 py-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                                                        onClick={() => openEdit(r)}
                                                        title="Edit room"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </button>
                                                    <button
                                                        className="rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                                                        onClick={() => askDelete(r)}
                                                        title="Delete room"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-orange-100">
                        <p className="text-sm text-gray-600 flex items-center justify-between">
                            <span>Showing {viewRooms.length} of {allRooms.length} rooms</span>
                            <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>Room management system</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {openForm && (
                <RoomFormModal
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    initial={editing}
                    onSaved={afterSave}
                />
            )}

            {/* Confirm Delete */}
            <ConfirmDialog
                open={confirm.open}
                title="Delete Room"
                description={
                    <span>
                        Are you sure you want to delete room <b>{confirm.room_id}</b>?
                        <br />
                        This action cannot be undone.
                    </span>
                }
                confirmText="Delete"
                onCancel={() => setConfirm({ open: false, id: null, room_id: "" })}
                onConfirm={doDelete}
            />

            {/* Themed toaster */}
            <Toaster
                position="top-right"
                toastOptions={{
                    className: "border rounded-xl shadow-lg text-sm font-medium tracking-tight",
                    style: {
                        background: "#FFFFFF",
                        color: "#1F2937",
                        borderColor: "#FED7AA",
                    },
                    success: { iconTheme: { primary: "#F97316", secondary: "#FFFFFF" } },
                    error: { iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" } },
                }}
            />
        </div>
    );
}