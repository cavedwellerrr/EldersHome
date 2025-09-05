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
        available: "bg-emerald-50 text-emerald-700 border-emerald-200",
        maintenance: "bg-amber-50 text-amber-700 border-amber-200",
        reserved: "bg-sky-50 text-sky-700 border-sky-200",
        occupied: "bg-rose-50 text-rose-700 border-rose-200",
    };
    const cls = map[value] || "bg-neutral-100 text-neutral-700 border-neutral-200";
    return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs border capitalize ${cls}`}>
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
        <div className="min-h-screen bg-[#FFF7F2] text-neutral-800">
            {/* Header */}
            <div className="mx-auto max-w-7xl px-4 pt-6 pb-4">
                <div className="rounded-3xl border border-[#F4D7C8] bg-white/75 backdrop-blur shadow-sm px-5 py-4 flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">Rooms</h1>
                        <p className="text-sm text-neutral-600 mt-1">
                            {total} result{total !== 1 ? "s" : ""}{subtitle ? ` — ${subtitle}` : ""}
                        </p>
                    </div>
                    <button
                        className="inline-flex items-center gap-2 rounded-xl bg-[#F29B77] text-white px-4 py-2.5 shadow hover:brightness-95"
                        onClick={openAdd}
                    >
                        <Plus className="size-4" />
                        Add Room
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mx-auto max-w-7xl px-4">
                <form
                    onSubmit={onSearch}
                    className="mb-5 rounded-3xl border border-[#F4D7C8] bg-white/70 backdrop-blur px-4 md:px-5 py-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <select
                            className="select select-bordered rounded-full focus:outline-none focus:ring-2 focus:ring-[#F29B77]"
                            value={filters.floor}
                            onChange={(e) => setFilters((f) => ({ ...f, floor: e.target.value }))}
                        >
                            <option value="">All Floors</option>
                            {FLOOR_OPTIONS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>

                        <select
                            className="select select-bordered rounded-full focus:outline-none focus:ring-2 focus:ring-[#F29B77]"
                            value={filters.type}
                            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                        >
                            <option value="">All Types</option>
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <select
                            className="select select-bordered rounded-full focus:outline-none focus:ring-2 focus:ring-[#F29B77]"
                            value={filters.status}
                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        >
                            <option value="">All Status</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        {/* search with icon */}
                        <label className="rounded-full border border-neutral-200 bg-white py-2.5 px-3 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#F29B77]">
                            <Search className="size-4 opacity-60" />
                            <input
                                className="grow outline-none"
                                placeholder="Search by Room ID (e.g. 1-01)"
                                value={filters.q}
                                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                            />
                        </label>

                        <div className="flex gap-2">
                            <button className="rounded-full bg-neutral-800 text-white px-4 py-2.5 w-full md:w-auto hover:opacity-90" type="submit">
                                Search
                            </button>
                            <button type="button" className="rounded-full px-4 py-2.5 hover:bg-neutral-100" onClick={resetFilters}>
                                Reset
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Table card */}
            <div className="mx-auto max-w-7xl px-4 pb-10">
                <div className="rounded-3xl border border-[#F4D7C8] bg-white/80 backdrop-blur shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead className="bg-[#FFF2EA]">
                                <tr>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">#</th>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">Room ID</th>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">Floor</th>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">Type</th>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">Status</th>
                                    <th className="text-xs uppercase tracking-wide text-neutral-600">Updated</th>
                                    <th className="text-right pr-6 text-xs uppercase tracking-wide text-neutral-600">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="p-8 text-center">
                                                <span className="loading loading-spinner loading-md" />
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading && viewRooms.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="p-10 text-center text-neutral-600">
                                                No rooms found. Try different filters or add a new room.
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    viewRooms.map((r, idx) => (
                                        <tr key={r._id} className="hover:bg-neutral-50">
                                            <td>{idx + 1}</td>
                                            <td className="font-mono">
                                                <span className="inline-block rounded-full border border-neutral-300 px-2 py-0.5 text-xs">
                                                    {r.room_id}
                                                </span>
                                            </td>
                                            <td>{r.floor}</td>
                                            <td>{r.type}</td>
                                            <td><StatusBadge value={r.status} /></td>
                                            <td className="whitespace-nowrap">{new Date(r.updatedAt).toLocaleString()}</td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2 pr-4">
                                                    <button
                                                        className="rounded-full px-3 py-1.5 hover:bg-neutral-100 inline-flex items-center gap-1"
                                                        onClick={() => openEdit(r)}
                                                        aria-label="Edit"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="size-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="rounded-full px-3 py-1.5 bg-rose-600 text-white hover:opacity-90 inline-flex items-center gap-1"
                                                        onClick={() => askDelete(r)}
                                                        aria-label="Delete"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
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
                    className: "border rounded-xl shadow-md text-sm font-medium tracking-tight",
                    style: {
                        background: "#FFFFFF",
                        color: "#1F1F1F",
                        borderColor: "#F4D7C8",
                    },
                    success: { iconTheme: { primary: "#F29B77", secondary: "#FFFFFF" } },
                    error: { iconTheme: { primary: "#E34242", secondary: "#FFFFFF" } },
                }}
            />
        </div>
    );
}
