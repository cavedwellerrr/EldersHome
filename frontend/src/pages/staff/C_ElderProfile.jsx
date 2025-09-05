import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchElderProfile } from "../../api/caretakerApi.js";
import MealPreferences from "../../components/wellness/MealPreferences.jsx";
import RoomAssignment from "../../components/wellness/RoomAssignment.jsx";

function ageFromDob(dob) {
    try {
        const d = new Date(dob);
        const diff = Date.now() - d.getTime();
        const a = new Date(diff);
        return Math.abs(a.getUTCFullYear() - 1970);
    } catch { return "-"; }
}

const InfoRow = ({ label, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-orange-50 last:border-0">
        <div className="text-slate-600 font-medium">{label}</div>
        <div className="font-semibold text-slate-800">{children}</div>
    </div>
);

const ElderProfile = () => {
    const { elderId } = useParams();
    const [elder, setElder] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await fetchElderProfile(elderId);
            setElder(data);
        })();
    }, [elderId]);

    const loading = !elder;

    const header = useMemo(() => {
        if (!elder) return { title: "Elder Profile", subtitle: "" };
        return {
            title: elder.fullName,
            subtitle: elder.status ? `Status: ${elder.status}` : "",
        };
    }, [elder]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{header.title}</h1>
                            <p className="text-orange-100 text-lg">{header.subtitle}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 -mt-6">
                {/* Basic Details + Guardian */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                            <h2 className="font-bold text-white text-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Basic Details
                            </h2>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-orange-200 rounded w-2/3" />
                                    <div className="h-4 bg-orange-200 rounded w-1/2" />
                                    <div className="h-4 bg-orange-200 rounded w-1/2" />
                                </div>
                            ) : (
                                <div>
                                    <InfoRow label="Full name">{elder.fullName}</InfoRow>
                                    <InfoRow label="Date of Birth">
                                        {elder.dob ? new Date(elder.dob).toLocaleDateString() : "-"}
                                    </InfoRow>
                                    <InfoRow label="Age">{ageFromDob(elder.dob)}</InfoRow>
                                    <InfoRow label="Room">{elder.roomAssigned || "Not assigned"}</InfoRow>
                                    <div className="mt-6">
                                        <div className="text-slate-600 font-medium mb-3">Medical Notes</div>
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 whitespace-pre-wrap text-sm text-slate-700">
                                            {elder.medicalNotes || "No medical notes available"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                            <h2 className="font-bold text-white text-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Contact Guardians
                            </h2>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-orange-200 rounded w-2/3" />
                                    <div className="h-4 bg-orange-200 rounded w-1/2" />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <InfoRow label="Name">{elder?.guardian?.name || "Not specified"}</InfoRow>
                                    <InfoRow label="Phone">{elder?.guardian?.phone || "Not specified"}</InfoRow>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meal Preferences */}
                <MealPreferences elder={elder} disabled={loading} />

                {/* Room Assignment */}
                <RoomAssignment elder={elder} disabled={loading} />
            </div>
        </div>
    );
};

export default ElderProfile;