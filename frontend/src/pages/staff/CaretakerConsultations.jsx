// frontend/src/pages/staff/CaretakerConsultations.jsx
import { useEffect, useMemo, useState, useRef, forwardRef } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import { FaDownload, FaTimes } from "react-icons/fa";

export default function CaretakerConsultations() {
  const [elders, setElders] = useState([]);
  const [caretakerId, setCaretakerId] = useState("");
  const [consultations, setConsultations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [selectedElder, setSelectedElder] = useState(null);
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [doctorId, setDoctorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchElder, setSearchElder] = useState("");
  const [searchAppt, setSearchAppt] = useState("");
  const [searchPresc, setSearchPresc] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [prescDate, setPrescDate] = useState("");
  const [sortLatest, setSortLatest] = useState(true);
  const [consultSortLatest, setConsultSortLatest] = useState(true);

  const eldersRef = useRef(null);
  const appointmentsRef = useRef(null);
  const consultationsRef = useRef(null);
  const prescriptionsRef = useRef(null);

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

  // ✨ --- NEW: Centralized date formatting function ---
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";

    // Options to format the date for Sri Lanka's timezone and a readable format
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Colombo",
    };

    return date.toLocaleString("en-US", options);
  };

  //  FETCH
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

  const fetchPrescriptions = async () => {
    try {
      const token = getToken();
      const res = await api.get("/prescriptions/caretaker/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrescriptions(res.data || []);
    } catch {
      toast.error("Failed to load prescriptions");
    }
  };

  useEffect(() => {
    fetchElders();
    fetchConsultations();
    fetchDoctors();
    fetchAppointments();
    fetchPrescriptions();
  }, []);

  //  SUBMIT
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

  //  DELETE
  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const token = getToken();
      await api.delete(`/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${type} deleted!`);
      if (type === "appointments")
        setAppointments((prev) => prev.filter((a) => a._id !== id));
      if (type === "consultations")
        setConsultations((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error(`Failed to delete ${type}`);
    }
  };

  // appointment download
  const downloadAppointmentPDF = (appt) => {
    const doc = new jsPDF();

    // Theme color (Tailwind bg-orange-500)
    const orange = "#F97316";

    //  HEADER
    doc.setFillColor(249, 115, 22); // orange-500 RGB(249,115,22)
    doc.rect(0, 0, 210, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Elders Care Home", 14, 20);

    //  TITLE
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Appointment Slip", 105, 45, { align: "center" });

    //  CARD SECTION
    doc.setDrawColor(249, 115, 22); // border orange
    doc.setLineWidth(1);
    doc.roundedRect(15, 55, 180, 90, 6, 6);

    //  LABELS & VALUES
    const labels = [
      "Elder Name:",
      "Doctor Name:",
      "Specialization:",
      "Appointment Date:",
      "Status:",
    ];

    const values = [
      appt.elder?.fullName || "—",
      appt.doctor?.staff?.name || "—",
      appt.doctor?.specialization || "—",
      formatDate(appt.date), // ✨ MODIFIED
      appt.status || "—",
    ];

    let y = 72;
    doc.setFontSize(12);
    for (let i = 0; i < labels.length; i++) {
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.text(labels[i], 25, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(values[i], 80, y);
      y += 15;
    }

    //  FOOTER BAR
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 160, 210, 20, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Please bring this slip on your appointment day and arrive 15 min before the consultation time. For inquiries, contact your Doctor.",
      105,
      172,
      { align: "center" }
    );

    //  FOOTER CREDIT
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Generated by Elders Home System", 105, 190, {
      align: "center",
    });

    // Save file
    doc.save(`Appointment_${appt._id}.pdf`);
  };

  //  FILTERS
  const filteredElders = useMemo(() => {
    if (!searchElder.trim()) return elders;
    const s = searchElder.toLowerCase();
    return elders.filter(
      (e) =>
        e.fullName.toLowerCase().includes(s) ||
        e.guardian?.name?.toLowerCase().includes(s)
    );
  }, [elders, searchElder]);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    if (searchAppt.trim()) {
      const s = searchAppt.toLowerCase();
      list = list.filter(
        (a) =>
          a.elder?.fullName?.toLowerCase().includes(s) ||
          a.doctor?.staff?.name?.toLowerCase().includes(s)
      );
    }
    if (apptDate) {
      list = list.filter(
        (a) => new Date(a.date).toISOString().slice(0, 10) === apptDate
      );
    }
    list.sort((a, b) =>
      sortLatest
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [appointments, searchAppt, apptDate, sortLatest]);

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
  }, [consultations, statusFilter, consultSortLatest]);

  const filteredPrescriptions = useMemo(() => {
    let list = [...prescriptions];
    if (searchPresc.trim()) {
      const s = searchPresc.toLowerCase();
      list = list.filter(
        (p) =>
          p.elder?.fullName?.toLowerCase().includes(s) ||
          p.doctor?.staff?.name?.toLowerCase().includes(s)
      );
    }
    if (prescDate) {
      list = list.filter(
        (p) => new Date(p.createdAt).toISOString().slice(0, 10) === prescDate
      );
    }
    return list;
  }, [prescriptions, searchPresc, prescDate]);

  const nextAppointmentDate = useMemo(() => {
    const now = new Date();
    const upcomingAppointments = appointments
      .filter(
        (appt) =>
          new Date(appt.date) > now &&
          appt.status !== "Cancelled" &&
          appt.status !== "Completed" // Exclude completed appointments
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcomingAppointments.length > 0) {
      return formatDate(upcomingAppointments[0].date); // ✨ MODIFIED
    }

    return "No upcoming";
  }, [appointments]);

  // ---------- RENDER ----------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-orange-600">
        Consultations Dashboard
      </h1>
      <p className="text-gray-600">
        Manage elders, appointments, consultations, and prescriptions
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
        <StatCard
          title="Total Elders"
          value={elders.length}
          icon="👴"
          onClick={() => eldersRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
        <StatCard
          title="Appointments"
          value={appointments.length}
          icon="📅"
          onClick={() =>
            appointmentsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
        <StatCard
          title="Next Appointment"
          value={nextAppointmentDate}
          icon="🗓️"
          onClick={() => appointmentsRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
        <StatCard
          title="Consultations"
          value={consultations.length}
          icon="💬"
          onClick={() =>
            consultationsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
        <StatCard
          title="Pending Requests"
          value={consultations.filter((c) => c.status === "Pending").length}
          icon="🕑"
          onClick={() =>
            consultationsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
      </div>

      <TableSection
        ref={eldersRef}
        title="Assigned Elders"
        searchValue={searchElder}
        onSearchChange={setSearchElder}
        columns={["Name", "Age", "Guardian", "Request a Consultation"]}
        rows={filteredElders.map((e) => [
          e.fullName,
          calcAge(e.dob),
          e.guardian?.name || "—",
          <button
            key={e._id}
            onClick={() => setSelectedElder(e)}
            className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            Request
          </button>,
        ])}
      />

      <TableSection
        ref={appointmentsRef}
        title="My Appointments"
        searchValue={searchAppt}
        onSearchChange={setSearchAppt}
        dateValue={apptDate}
        onDateChange={setApptDate}
        columns={[
          "Elder",
          "Doctor",
          "Date",
          "Consultation",
          "Download",
          "Action",
        ]}
        rows={filteredAppointments.map((a) => [
          a.elder?.fullName || "—",
          a.doctor?.staff?.name || "—",
          formatDate(a.date), // ✨ MODIFIED
          <StatusBadge status={a.status} />,
          <button
            key={`dl-${a._id}`}
            onClick={() => downloadAppointmentPDF(a)}
            className="text-blue-600 hover:text-blue-800"
            title="Download Appointment Slip"
          >
            <FaDownload />
          </button>,
          <button
            key={`del-${a._id}`}
            onClick={() => handleDelete(a._id, "appointments")}
            className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>,
        ])}
      />

      {/* Consultations Table */}
      <div ref={consultationsRef} className="rounded-lg border shadow">
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
                    <Td>
                      <ConsultationStatusBadge status={c.status} />
                    </Td>
                    <Td>{c.responseNotes || "—"}</Td>
                    <Td>{formatDate(c.requestDate)}</Td> {/* ✨ MODIFIED */}
                    <Td>
                      <button
                        onClick={() => handleDelete(c._id, "consultations")}
                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <TableSection
        ref={prescriptionsRef}
        title="My Elders' Prescriptions"
        searchValue={searchPresc}
        onSearchChange={setSearchPresc}
        dateValue={prescDate}
        onDateChange={setPrescDate}
        columns={[
          "Elder",
          "Doctor",
          "Specialization",
          "Date",
          "Notes",
          "Medicines",
        ]}
        rows={filteredPrescriptions.map((p) => [
          p.elder?.fullName || "—",
          p.doctor?.staff?.name || "—",
          p.doctor?.specialization || "—",
          formatDate(p.createdAt), // ✨ MODIFIED
          p.notes || "—",
          <div key={p._id}>
            {p.drugs?.map((d, i) => (
              <div key={i}>
                {d.name} – {d.dosage}, {d.frequency} for {d.duration}
              </div>
            ))}
          </div>,
        ])}
      />

      {/* Consultation Modal */}
      {selectedElder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Request Consultation
            </h2>
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
function ConsultationStatusBadge({ status }) {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {status}
    </span>
  );
}

//  other components
function StatCard({ title, value, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300 cursor-pointer"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-bold text-orange-600">{value}</h3>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  );
}

const TableSection = forwardRef(function TableSection(
  {
    title,
    searchValue,
    onSearchChange,
    dateValue,
    onDateChange,
    columns,
    rows,
  },
  ref
) {
  return (
    <div ref={ref} className="rounded-lg border shadow">
      <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
        {title}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="border p-2 rounded-lg flex-1"
          />
          {dateValue !== undefined && (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="border p-2 rounded-lg"
            />
          )}
          <button
            onClick={() => {
              onSearchChange("");
              if (onDateChange) onDateChange("");
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
            title="Clear Filters"
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((c) => (
                  <Th key={c}>{c}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {r.map((v, j) => (
                    <Td key={j}>{v}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

const Th = ({ children }) => (
  <th className="px-4 py-2 text-left font-medium">{children}</th>
);
const Td = ({ children }) => <td className="px-4 py-2">{children}</td>;

function StatusBadge({ status }) {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Scheduled: "bg-blue-100 text-blue-800 border-blue-300",
    Completed: "bg-green-100 text-green-800 border-green-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
    Confirmed: "bg-purple-100 text-purple-800 border-purple-300",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {status}
    </span>
  );
}