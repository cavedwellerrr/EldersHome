import React, { useEffect, useRef, useState } from "react";
import api from "../../api.js";
import toast from "react-hot-toast";

const FLOOR_OPTIONS = ["Ground", "1", "2", "3"];
const TYPE_OPTIONS = ["AC", "Non-AC"];
const STATUS_OPTIONS = ["available", "maintenance", "reserved"]; // 'occupied' intentionally excluded

const fieldBase =
    "w-full rounded-xl border border-neutral-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#F29B77] py-2.5 px-3";

export default function RoomFormModal({ open, onClose, initial, onSaved }) {
    const dlgRef = useRef(null);

    const [room_id, setRoomId] = useState("");
    const [floor, setFloor] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("available");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && dlgRef.current) dlgRef.current.showModal();
    }, [open]);

    useEffect(() => {
        if (initial) {
            setRoomId(initial.room_id || "");
            setFloor(initial.floor || "");
            setType(initial.type || "");
            setStatus(initial.status || "available");
        } else {
            setRoomId("");
            setFloor("");
            setType("");
            setStatus("available");
        }
    }, [initial]);

    const close = () => {
        if (dlgRef.current?.open) dlgRef.current.close();
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { room_id, floor, type, status };
            if (initial?._id) {
                await api.put(`/rooms/${initial._id}`, payload);
                toast.success("Room updated");
            } else {
                await api.post("/rooms", payload);
                toast.success("Room created");
            }
            close();
            onSaved?.();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <dialog ref={dlgRef} className="modal">
            <div className="modal-box max-w-xl rounded-3xl p-0 overflow-hidden border border-[#F4D7C8]">
                {/* header */}
                <div className="px-6 py-4 bg-[#FFF2EA] border-b border-[#F4D7C8]">
                    <h3 className="font-semibold text-xl text-neutral-900">
                        {initial ? "Edit Room" : "Add Room"}
                    </h3>
                </div>

                {/* body */}
                <div className="px-6 py-5">
                    <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Room ID</label>
                            <input
                                className={fieldBase}
                                placeholder="e.g. G-01"
                                value={room_id}
                                onChange={(e) => setRoomId(e.target.value)}
                                required
                            />
                            <p className="text-xs text-neutral-500 mt-1">Must be unique (e.g. G-01, 1-12)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Floor</label>
                                <select className={fieldBase} value={floor} onChange={(e) => setFloor(e.target.value)} required>
                                    <option value="">Select floor</option>
                                    {FLOOR_OPTIONS.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Type</label>
                                <select className={fieldBase} value={type} onChange={(e) => setType(e.target.value)} required>
                                    <option value="">Select type</option>
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Status</label>
                                <select className={fieldBase} value={status} onChange={(e) => setStatus(e.target.value)} required>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* actions */}
                        <div className="mt-2 flex items-center justify-end gap-2">
                            <button type="button" className="px-4 py-2.5 rounded-xl hover:bg-neutral-100" onClick={close}>
                                Cancel
                            </button>
                            <button
                                className={`rounded-xl px-5 py-2.5 text-white shadow ${saving ? "bg-[#F29B77]/70 cursor-not-allowed" : "bg-[#F29B77] hover:brightness-95"
                                    }`}
                                type="submit"
                            >
                                {saving && <span className="loading loading-spinner mr-2" />}
                                {initial ? "Save" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* click outside to close */}
            <form method="dialog" className="modal-backdrop" onClick={close}>
                <button>close</button>
            </form>
        </dialog>
    );
}
