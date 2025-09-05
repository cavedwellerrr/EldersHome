import React, { useEffect, useMemo, useState } from "react";
import { assignRoom, fetchRooms } from "../../api/caretakerApi";

const FLOORS = ["Ground", "1", "2", "3"];
const TYPES = ["AC", "Non-AC"];
const STATUSES = ["available", "occupied", "maintenance", "reserved"];

const RoomAssignment = ({ elder, disabled }) => {
    const elderId = elder?._id;
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    const [floors, setFloors] = useState(["Ground", "1", "2", "3"]);
    const [types, setTypes] = useState(["AC", "Non-AC"]);
    const [statuses, setStatuses] = useState(["available"]);

    const [rooms, setRooms] = useState([]);

    const toggle = (value, arrSetter) => {
        arrSetter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    useEffect(() => {
        (async () => {
            const rs = await fetchRooms({ floors, types, statuses });
            setRooms(rs);
        })();
    }, [floors, types, statuses]);

    useEffect(() => {
        setSelectedRoomId(null);
    }, [floors, types, statuses]);

    const canAssign = useMemo(() => !!(elderId && selectedRoomId), [elderId, selectedRoomId]);

    const onAssign = async () => {
        const res = await assignRoom(elderId, selectedRoomId);
        alert(res?.message || "Assigned");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'text-green-600 bg-green-100';
            case 'occupied': return 'text-red-600 bg-red-100';
            case 'maintenance': return 'text-yellow-600 bg-yellow-100';
            case 'reserved': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-white text-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Room Assignment
                    </h2>
                    <div className="text-sm text-orange-100">
                        Current: <span className="font-semibold text-white bg-white/20 px-3 py-1 rounded-full">{elder?.roomAssigned || "Not assigned"}</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                            <div className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-sm font-semibold text-slate-700 mb-3">Floor</div>
                                    <div className="space-y-2">
                                        {FLOORS.map((f) => (
                                            <label key={f} className="flex items-center gap-3 text-sm cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={floors.includes(f)}
                                                    onChange={() => toggle(f, setFloors)}
                                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                                />
                                                <span className="text-slate-700 group-hover:text-orange-600 font-medium">{f}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-slate-700 mb-3">Type</div>
                                    <div className="space-y-2">
                                        {TYPES.map((t) => (
                                            <label key={t} className="flex items-center gap-3 text-sm cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={types.includes(t)}
                                                    onChange={() => toggle(t, setTypes)}
                                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                                />
                                                <span className="text-slate-700 group-hover:text-orange-600 font-medium">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-semibold text-slate-700 mb-3">Availability</div>
                                    <div className="space-y-2">
                                        {STATUSES.map((s) => (
                                            <label key={s} className="flex items-center gap-3 text-sm cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={statuses.includes(s)}
                                                    onChange={() => toggle(s, setStatuses)}
                                                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                                />
                                                <span className="text-slate-700 group-hover:text-orange-600 font-medium capitalize">{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-orange-200 rounded-xl divide-y divide-orange-100 max-h-80 overflow-auto shadow-sm">
                            {rooms.length === 0 && (
                                <div className="p-6 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-gray-500">No rooms match your filters.</p>
                                </div>
                            )}
                            {rooms.map((r) => (
                                <label key={r._id} className="flex items-center justify-between p-4 hover:bg-orange-25 cursor-pointer transition-colors group">
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-slate-800 mb-1">{r.room_id}</div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-600">Floor {r.floor}</span>
                                            <span className="text-slate-400">•</span>
                                            <span className="text-slate-600">{r.type}</span>
                                            <span className="text-slate-400">•</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name="room"
                                        checked={selectedRoomId === r._id}
                                        onChange={() => setSelectedRoomId(r._id)}
                                        disabled={r.status !== "available"}
                                        title={r.status !== "available" ? "Only available rooms can be selected" : ""}
                                        className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 disabled:opacity-50"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                disabled={disabled || !canAssign}
                                onClick={onAssign}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Assign Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomAssignment;