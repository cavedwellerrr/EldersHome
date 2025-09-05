// Centralized API helpers; uses mock fallbacks until your backend endpoints are ready.
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function fetchAssignedElders() {
    try {
        const { data } = await axios.get(`${API_BASE}/api/caretaker/elders/my-elders`, { withCredentials: true });
        // Expecting: [{ _id, fullName, dob, roomAssigned, guardian: {name, phone}, status }]
        return data?.elders ?? [];
    } catch {
        // --- Mock fallback ---
        return [
            {
                _id: "demo-elder-1",
                fullName: "Nimal Perera",
                dob: "1953-05-18T00:00:00.000Z",
                roomAssigned: "G-07",
                status: "ACTIVE",
                guardian: { name: "Sunil Perera", phone: "0771234567" },
            },
            {
                _id: "demo-elder-2",
                fullName: "Saraswathi N",
                dob: "1948-11-02T00:00:00.000Z",
                roomAssigned: "",
                status: "PAYMENT_SUCCESS",
                guardian: { name: "M. Ramesh", phone: "0719876543" },
            },
        ];
    }
}

export async function fetchElderProfile(elderId) {
    try {
        const { data } = await axios.get(`${API_BASE}/api/caretaker/elders/${elderId}`, { withCredentials: true });
        return data;
    } catch {
        // --- Mock fallback for profile ---
        return {
            _id: elderId || "demo-elder-1",
            fullName: "Nimal Perera",
            dob: "1953-05-18T00:00:00.000Z",
            medicalNotes: "Hypertension; low-salt diet",
            roomAssigned: "G-07",
            status: "ACTIVE",
            guardian: { name: "Sunil Perera", phone: "0771234567" },
            mealPreference: {
                allergies: ["Peanuts"],
                selections: {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: [],
                },
                notes: "",
            },
        };
    }
}

export async function fetchMealsCatalog() {
    try {
        const { data } = await axios.get(`${API_BASE}/api/meals`, { withCredentials: true });
        // Expecting: [{ _id, name, category: "breakfast"|"lunch"|"dinner"|"snacks" }]
        return data?.meals ?? [];
    } catch {
        // --- Mock meals ---
        return [
            { _id: "m1", name: "String Hoppers", category: "breakfast" },
            { _id: "m2", name: "Milk Rice", category: "breakfast" },
            { _id: "m3", name: "Rice & Curry (Chicken)", category: "lunch" },
            { _id: "m4", name: "Dhal Curry", category: "lunch" },
            { _id: "m5", name: "Fried Rice (Egg)", category: "dinner" },
            { _id: "m6", name: "Soup & Bread", category: "dinner" },
            { _id: "m7", name: "Fruits Bowl", category: "snacks" },
            { _id: "m8", name: "Yogurt", category: "snacks" },
        ];
    }
}

export async function fetchRooms(params = {}) {
    const { floors = [], types = [], statuses = ["available"] } = params;
    try {
        const query = new URLSearchParams();
        if (floors.length) query.set("floors", floors.join(","));
        if (types.length) query.set("types", types.join(","));
        if (statuses.length) query.set("statuses", statuses.join(","));
        const { data } = await axios.get(`${API_BASE}/api/rooms?${query.toString()}`, { withCredentials: true });
        // Expect: [{ _id, room_id, floor, type, status, elder }]
        return data?.rooms ?? [];
    } catch {
        // --- Mock rooms ---
        const mock = [
            { _id: "r1", room_id: "G-01", floor: "Ground", type: "AC", status: "available" },
            { _id: "r2", room_id: "1-12", floor: "1", type: "Non-AC", status: "available" },
            { _id: "r3", room_id: "2-05", floor: "2", type: "AC", status: "maintenance" },
            { _id: "r4", room_id: "3-09", floor: "3", type: "AC", status: "occupied" },
        ];
        return mock.filter(r => ["available"].includes(r.status));
    }
}

// POST/PUT stubs to wire later:
export async function saveMealPreferences(elderId, payload) {
    // return axios.put(`${API_BASE}/api/caretaker/elders/${elderId}/meal-preferences`, payload, { withCredentials: true });
    return { success: true, message: "(mock) saved" };
}

export async function assignRoom(elderId, roomId) {
    // return axios.post(`${API_BASE}/api/caretaker/elders/${elderId}/assign-room`, { roomId }, { withCredentials: true });
    return { success: true, message: `(mock) assigned ${roomId} to ${elderId}` };
}
