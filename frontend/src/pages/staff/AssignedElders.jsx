import { useEffect, useMemo, useState } from "react";
import api from "../../api"; // uses baseURL http://localhost:5000/api

export default function AssignedElders() {
  const [elders, setElders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  // helpers
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

  // client-side search over common visible fields
  const filtered = useMemo(() => {
    if (!q.trim()) return elders;
    const s = q.toLowerCase();
    return elders.filter((e) =>
      [
        e?.fullName,
        String(calcAge(e?.dob) ?? ""),
        e?.gender,
        e?.room?.room_id,
        e?.guardian?.name,
        e?.guardian?.phone,
        e?.medicalNotes,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, elders]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("staffToken");
        if (!token) {
          setErr("You are not logged in as staff. Please log in first.");
          setLoading(false);
          return;
        }

        // Backend expects Bearer header
        const res = await api.get("/caretaker/elders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setElders(res.data?.elders || []);
        setCount(res.data?.count ?? (res.data?.elders?.length || 0));
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load assigned elders";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">
          Assigned Elders{count ? ` (${count})` : ""}
        </h1>

        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name / room / guardian / phone"
            className="w-full md:w-80 rounded-lg border px-3 py-2 focus:outline-none focus:ring"
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border p-4">Loading assigned elders…</div>
      )}

      {!loading && err && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="rounded-lg border p-4">No elders found.</div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Name</Th>
                <Th>Age</Th>
                <Th>Gender</Th>
                <Th>Room</Th>
                <Th>Guardian</Th>
                <Th>Phone</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e._id} className="border-t">
                  <Td className="font-medium">{e?.fullName || "—"}</Td>
                  <Td>{calcAge(e?.dob) ?? "—"}</Td>
                  <Td>{e?.gender || "—"}</Td>
                  <Td>{e?.room?.room_id || "—"}</Td>
                  <Td>{e?.guardian?.name || "—"}</Td>
                  <Td>{e?.guardian?.phone || "—"}</Td>
                  <Td className="max-w-[320px]">
                    <span title={e?.medicalNotes || ""}>
                      {e?.medicalNotes ? truncate(e.medicalNotes, 60) : "—"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// small helpers for clean JSX
function Th({ children }) {
  return <th className="text-left px-3 py-2">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
