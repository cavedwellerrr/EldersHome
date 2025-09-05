// src/pages/staff/ElderProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Users, FileText, Utensils, AlertTriangle } from "lucide-react";
import api from "../../api";

// NEW: import extracted components
import RoomAssignmentSection from "../../components/wellness/RoomAssignmentSection.jsx";
import MealAssignmentSection from "../../components/wellness/MealAssignmentSection.jsx";

export default function ElderProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [elder, setElder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const calcAge = (dob) => {
        if (!dob) return null;
        const d = new Date(dob);
        if (Number.isNaN(d.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age;
    };

    const reload = async () => {
        setLoading(true);
        setErr("");
        try {
            const token = localStorage.getItem("staffToken");
            if (!token) {
                setErr("You are not logged in as staff. Please log in first.");
                setLoading(false);
                return;
            }
            const res = await api.get(`/caretaker/elders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setElder(res.data?.elder || null);
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || "Failed to load elder";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, [id]);

    // Initials for avatar
    const initials = useMemo(() => {
        const n = elder?.fullName?.trim() || "";
        const parts = n.split(/\s+/);
        return parts.length ? (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase() : "👤";
    }, [elder?.fullName]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Hero Header */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-t-xl" />
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-orange-600">{initials}</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2">
                                        <StatusBadge status={elder?.status} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {elder?.fullName || "Elder Profile"}
                                    </h1>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                            {elder?.gender || "—"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                            {elder?.dob ? `${calcAge(elder.dob)} years old` : "Age —"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <span className="loading loading-spinner loading-lg text-orange-500"></span>
                        <p className="text-gray-600 mt-4">Loading elder profile...</p>
                    </div>
                )}

                {!loading && err && (
                    <div className="alert alert-error shadow-lg">
                        <AlertTriangle className="w-6 h-6" />
                        <span>{err}</span>
                    </div>
                )}

                {!loading && !err && elder && (
                    <>
                        <div className="grid gap-6 lg:grid-cols-3 items-start">
                            {/* Left Side - Elder Details */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white rounded-xl shadow-lg">
                                    <div className="bg-gray-50 p-4 rounded-t-xl border-b">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            Personal Information
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <InfoRow label="Full Name" value={elder.fullName} />
                                            <InfoRow
                                                label="Age"
                                                value={calcAge(elder.dob) ? `${calcAge(elder.dob)} years` : "—"}
                                            />
                                            <InfoRow label="Gender" value={elder.gender} />
                                            <InfoRow
                                                label="Date of Birth"
                                                value={
                                                    elder.dob
                                                        ? new Date(elder.dob).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })
                                                        : "—"
                                                }
                                            />
                                            <InfoRow
                                                label="Disability Status"
                                                value={
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${elder.isDisabled
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                            }`}
                                                    >
                                                        {elder.isDisabled ? "Yes" : "No"}
                                                    </span>
                                                }
                                            />
                                            <InfoRow
                                                label="Registered"
                                                value={
                                                    elder.createdAt
                                                        ? new Date(elder.createdAt).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "—"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div className="bg-white rounded-xl shadow-lg">
                                    <div className="bg-gray-50 p-4 rounded-t-xl border-b">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            Guardian Information
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            <InfoRow label="Guardian Name" value={elder.guardian?.name} />
                                            <InfoRow
                                                label="Phone Number"
                                                value={
                                                    elder.guardian?.phone ? (
                                                        <span className="font-mono text-orange-600">
                                                            {elder.guardian.phone}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Notes */}
                                <div className="bg-white rounded-xl shadow-lg">
                                    <div className="bg-gray-50 p-4 rounded-t-xl border-b">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-orange-500" />
                                            Medical Notes
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                                                {elder.medicalNotes || "No medical notes recorded."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Room Section */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl shadow-lg">
                                    <div className="bg-gray-50 p-4 rounded-t-xl border-b">
                                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Home className="w-5 h-5 text-orange-500" />
                                            Room Assignment
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <RoomAssignmentSection
                                            elderId={id}
                                            currentRoom={elder.room}
                                            onChanged={reload}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meal Assignment */}
                        <div className="bg-white rounded-xl shadow-lg">
                            <div className="bg-gray-50 p-4 rounded-t-xl border-b">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-orange-500" />
                                    Meal Management
                                </h3>
                            </div>
                            <div className="p-6">
                                <MealAssignmentSection elderId={id} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ---------- Local-only helpers (unchanged) ---------- */
function StatusBadge({ status }) {
    if (!status) return null;

    const statusConfig = {
        ACTIVE: { class: "bg-green-100 text-green-800", label: "Active" },
        PAYMENT_SUCCESS: { class: "bg-green-100 text-green-800", label: "Active" },
        REJECTED: { class: "bg-red-100 text-red-800", label: "Rejected" },
        DISABLED_PENDING_REVIEW: { class: "bg-yellow-100 text-yellow-800", label: "Under Review" },
        APPROVED_AWAITING_PAYMENT: { class: "bg-yellow-100 text-yellow-800", label: "Awaiting Payment" },
    };

    const config = statusConfig[status] || { class: "bg-gray-100 text-gray-800", label: status };

    return (
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${config.class}`}>
            {config.label}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-start gap-4 py-2">
            <span className="text-sm text-gray-600 font-medium">{label}</span>
            <span className="text-sm text-right font-semibold text-gray-900">
                {typeof value === "string" ? (value || "—") : value}
            </span>
        </div>
    );
}
