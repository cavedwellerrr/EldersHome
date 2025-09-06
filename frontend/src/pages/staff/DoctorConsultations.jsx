// frontend/src/pages/staff/DoctorConsultations.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DoctorConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // ✅ Fetch pending consultations
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/consultations/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // ✅ Approve consultation → create appointment
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      // ✅ fetch doctor profile for logged-in staff
      const resDoctor = await api.get("/doctors/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorId = resDoctor.data._id;

      // save doctorId for reuse later
      localStorage.setItem("doctorId", doctorId);

      const isoDate = new Date(`${date}T${time}`).toISOString();

      await api.patch(
        `/consultations/${selectedConsultation._id}`,
        {
          status: "Approved",
          doctorId,
          date: isoDate,
          responseNotes: notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Consultation approved and appointment created");
      setSelectedConsultation(null);
      setDate("");
      setTime("");
      setNotes("");
      fetchConsultations();
    } catch (e) {
      toast.error("Failed to approve consultation");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Reject consultation
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this consultation?")) return;
    try {
      const token = getToken();
      await api.patch(
        `/consultations/${id}`,
        { status: "Rejected", responseNotes: "Rejected by doctor" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Consultation rejected");
      fetchConsultations();
    } catch (e) {
      toast.error("Failed to reject consultation");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        Pending Consultations
      </h1>

      {loading && <p>Loading consultations…</p>}
      {err && <p className="text-red-500">{err}</p>}

      {!loading && consultations.length === 0 && (
        <p>No pending consultations found.</p>
      )}

      {!loading && consultations.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <Th>Elder</Th>
                <Th>Guardian</Th>
                <Th>Caretaker</Th>
                <Th>Reason</Th>
                <Th>Priority</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c._id} className="border-t">
                  <Td>{c.elder?.fullName || "—"}</Td>
                  <Td>{c.elder?.guardian?.name || "—"}</Td>
                  <Td>{c.caretaker?.staff?.name || "—"}</Td>
                  <Td>{c.reason}</Td>
                  <Td>{c.priority}</Td>
                  <Td>
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 mr-2"
                      onClick={() => setSelectedConsultation(c)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      onClick={() => handleReject(c._id)}
                    >
                      Reject
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Approve Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Approve Consultation</h2>
            <form onSubmit={handleApprove} className="space-y-3">
              <div>
                <label className="block text-sm">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedConsultation(null)}
                  className="px-3 py-1 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {submitting ? "Submitting…" : "Confirm"}
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
  return <th className="text-left px-3 py-2">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
