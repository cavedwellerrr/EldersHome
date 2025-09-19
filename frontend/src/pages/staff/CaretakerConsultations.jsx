// frontend/src/pages/staff/CaretakerConsultations.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CaretakerConsultations() {
  // ---------- STATE ----------
  const [elders, setElders] = useState([]);
  const [caretakerId, setCaretakerId] = useState("");
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedElder, setSelectedElder] = useState(null);
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [doctorId, setDoctorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [apptSearch, setApptSearch] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [sortLatest, setSortLatest] = useState(true);

  //  New state for consultations sort
  const [consultSortLatest, setConsultSortLatest] = useState(true);

  // ---------- HELPERS ----------
  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

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

  // ---------- FETCH ----------
  const fetchElders = async () => {
    try {
      const token = getToken();
      const res = await api.get("/caretaker/elders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElders(res.data?.elders || []);
      setCaretakerId(res.data?.caretakerId || "");
    } catch {
      toast.error("Failed to load elders");
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = getToken();
      const res = await api.get("/consultations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(res.data || []);
    } catch {
      toast.error("Failed to load consultations");
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = getToken();
      const res = await api.get("/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = getToken();
      const res = await api.get("/appointments/caretaker/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch {
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    fetchElders();
    fetchConsultations();
    fetchDoctors();
    fetchAppointments();
  }, []);

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !doctorId) {
      toast.error("Doctor and reason are required.");
      return;
    }
    try {
      setSubmitting(true);
      const token = getToken();
      await api.post(
        "/consultations",
        { elderId: selectedElder._id, caretakerId, doctorId, reason, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Consultation requested!");
      setSelectedElder(null);
      setReason("");
      setPriority("Normal");
      setDoctorId("");
      fetchConsultations();
    } catch {
      toast.error("Failed to request consultation");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const token = getToken();
      await api.delete(`/consultations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Consultation deleted!");
      setConsultations((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("DELETE /consultations/:id failed:", err?.response?.status, err?.response?.data);
      toast.error(err?.response?.data?.message || "Failed to delete consultation");
    }
  };

  // ---------- FILTER & SORT ----------
  const filteredConsultations = useMemo(() => {
    let list =
      statusFilter === "All"
        ? [...consultations]
        : consultations.filter((c) => c.status === statusFilter);

    list.sort((a, b) =>
      consultSortLatest
        ? new Date(b.requestDate) - new Date(a.requestDate)
        : new Date(a.requestDate) - new Date(b.requestDate)
    );

    return list;
  }, [statusFilter, consultations, consultSortLatest]);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    if (apptSearch.trim()) {
      const s = apptSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.elder?.fullName?.toLowerCase().includes(s) ||
          a.doctor?.staff?.name?.toLowerCase().includes(s)
      );
    }
    if (apptDate) {
      list = list.filter((a) => {
        const d = new Date(a.date).toISOString().slice(0, 10);
        return d === apptDate;
      });
    }
    list.sort((a, b) =>
      sortLatest
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [appointments, apptSearch, apptDate, sortLatest]);

  // ---------- RENDER ----------
  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-orange-600">Consultations</h1>
      <p className="text-gray-600">Manage elders, appointments, and consultations</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Elders" value={elders.length} icon="👴" />
        <StatCard title="Appointments" value={appointments.length} icon="📅" />
        <StatCard title="Consultations" value={consultations.length} icon="💬" />
        <StatCard
          title="Pending Requests"
          value={consultations.filter((c) => c.status === "Pending").length}
          icon="🕑"
        />
      </div>

      {/* Elders Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          Assigned Elders
        </div>
        <div className="p-4 overflow-x-auto">
          <input
            type="text"
            placeholder="Search elder or guardian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 p-2 border rounded-lg w-full md:w-1/3"
          />
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
              {elders.map((e, idx) => (
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
      </section>

      {/* Appointments Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          My Appointments
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by elder or doctor..."
              value={apptSearch}
              onChange={(e) => setApptSearch(e.target.value)}
              className="p-2 border rounded-lg w-60"
            />
            <input
              type="date"
              value={apptDate}
              onChange={(e) => setApptDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
            <button
              onClick={() => setSortLatest(!sortLatest)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {sortLatest ? "Sort: Latest → Oldest" : "Sort: Oldest → Latest"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <Th>Elder</Th>
                  <Th>Doctor</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a, idx) => (
                  <tr
                    key={a._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <Td>{a.elder?.fullName || "—"}</Td>
                    <Td>{a.doctor?.staff?.name || "—"}</Td>
                    <Td>{new Date(a.date).toLocaleString()}</Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : a.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : a.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </Td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-gray-500 text-center">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Consultations Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          My Consultation Requests
        </div>
        <div className="p-4">
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
            {/*  New Sort Toggle */}
            <button
              onClick={() => setConsultSortLatest(!consultSortLatest)}
              className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 ml-auto"
            >
              {consultSortLatest
                ? "Sort: Latest → Oldest"
                : "Sort: Oldest → Latest"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <Th>Elder</Th>
                  <Th>Reason</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Doctor Notes</Th>
                  <Th>Requested On</Th>
                  <Th>Action</Th>
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
                    <Td>{c.priority}</Td>
                    <Td>{c.status}</Td>
                    <Td>{c.responseNotes || "—"}</Td>
                    <Td>
                      {c.requestDate
                        ? new Date(c.requestDate).toLocaleString()
                        : "—"}
                    </Td>
                    <Td>
                      { (
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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
                <label className="block text-sm">Select Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc?.staff?.name} ({doc?.specialization})
                    </option>
                  ))}
                </select>
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

// ---------- SMALL COMPONENTS ----------
function StatCard({ title, value, icon }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  );
}
function Th({ children }) {
  return <th className="px-3 py-2 font-semibold text-left">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}