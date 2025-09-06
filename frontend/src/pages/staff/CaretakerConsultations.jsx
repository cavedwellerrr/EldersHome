// frontend/src/pages/staff/CaretakerConsultations.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CaretakerConsultations() {
  const [elders, setElders] = useState([]);
  const [caretakerId, setCaretakerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selectedElder, setSelectedElder] = useState(null);
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);

  const [consultations, setConsultations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // ✅ Fetch elders
  const fetchElders = async () => {
    try {
      const token = getToken();
      const res = await api.get("/caretaker/elders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElders(res.data?.elders || []);
      setCaretakerId(res.data?.caretakerId || "");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch consultations
  const fetchConsultations = async () => {
    try {
      const token = getToken();
      const res = await api.get("/consultations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(res.data || []);
    } catch (e) {
      console.error("Error fetching consultations", e);
    }
  };

  useEffect(() => {
    fetchElders();
    fetchConsultations();
  }, []);

  // ✅ Submit consultation request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Reason is required.");
      return;
    }
    try {
      setSubmitting(true);
      const token = getToken();
      await api.post(
        "/consultations",
        {
          elderId: selectedElder._id,
          caretakerId,
          reason,
          priority,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Consultation requested!");
      setSelectedElder(null);
      setReason("");
      setPriority("Normal");
      fetchConsultations(); // refresh
    } catch (e) {
      toast.error("Failed to request consultation");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Search elders
  const filteredElders = useMemo(() => {
    if (!search.trim()) return elders;
    const s = search.toLowerCase();
    return elders.filter((e) =>
      [e?.fullName, e?.guardian?.name].some((v) =>
        String(v || "").toLowerCase().includes(s)
      )
    );
  }, [search, elders]);

  // ✅ Filter consultations
  const filteredConsultations = useMemo(() => {
    if (statusFilter === "All") return consultations;
    return consultations.filter((c) => c.status === statusFilter);
  }, [statusFilter, consultations]);

  // ✅ Helper for age
  const calcAge = (dob) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return "—";
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-orange-600">
        Caretaker Consultations
      </h1>

      {/* Elders Table */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Assigned Elders</h2>
        <input
          type="text"
          placeholder="Search elder or guardian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 p-2 border rounded-lg w-full md:w-1/3"
        />
        <div className="overflow-x-auto rounded-lg border shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Name</Th>
                <Th>Age</Th>
                <Th>Guardian</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filteredElders.map((e, idx) => (
                <tr
                  key={e._id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <Td>{e.fullName}</Td>
                  <Td>{calcAge(e.dob)}</Td>
                  <Td>{e.guardian?.name || "—"}</Td>
                  <Td>
                    <button
                      onClick={() => setSelectedElder(e)}
                      className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Request
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultations Table */}
      <div>
        <h2 className="text-xl font-semibold mb-3">My Consultation Requests</h2>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-3">
          {["All", "Pending", "Approved", "Rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-lg border ${
                statusFilter === f
                  ? "bg-orange-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Elder</Th>
                <Th>Consultation Reason</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Doctor Notes</Th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.map((c, idx) => (
                <tr
                  key={c._id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <Td>{c.elder?.fullName || "—"}</Td>
                  <Td>{c.reason}</Td>
                  <Td
                    className={
                      c.priority === "Urgent"
                        ? "text-red-600 font-bold"
                        : "text-gray-700"
                    }
                  >
                    {c.priority}
                  </Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : c.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </Td>
                  <Td>{c.responseNotes || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedElder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Request Consultation</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Elder</label>
                <input
                  type="text"
                  value={selectedElder.fullName}
                  disabled
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm">Guardian</label>
                <input
                  type="text"
                  value={selectedElder.guardian?.name || "N/A"}
                  disabled
                  className="w-full border rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedElder(null)}
                  className="px-3 py-1 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

// Helpers
function Th({ children }) {
  return <th className="text-left px-3 py-2 font-semibold">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
