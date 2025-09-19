// frontend/src/pages/staff/DoctorAppointments.jsx
import { useEffect, useState } from "react";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // ✅ Fetch doctor’s appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Only keep upcoming (not completed) appointments
      const upcoming = (res.data || []).filter(
        (a) => a.status !== "completed" && new Date(a.date) > new Date()
      );

      setAppointments(upcoming);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✅ Mark appointment as completed
  const handleComplete = async (appointmentId) => {
    try {
      const token = getToken();
      await api.patch(
        `/appointments/${appointmentId}`,
        { status: "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment marked as completed");
      fetchAppointments(); // refresh list
    } catch (e) {
      toast.error("Failed to update appointment");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-orange-600">Doctor Dashboard</h1>
      <p className="text-gray-600">Manage your upcoming appointments</p>

      {/* Appointments Table */}
      <section className="rounded-lg border shadow">
        <div className="bg-orange-500 text-white p-3 rounded-t-lg font-semibold">
          Upcoming Appointments
        </div>
        <div className="p-4">
          {loading && <p className="text-orange-500">Loading appointments…</p>}
          {err && <p className="text-red-500">{err}</p>}

          {!loading && appointments.length === 0 && (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}

          {!loading && appointments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <Th>Elder</Th>
                    <Th>Caretaker</Th>
                    <Th>Date & Time</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a, idx) => (
                    <tr
                      key={a._id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <Td>{a.elder?.fullName || "—"}</Td>
                      <Td>{a.caretaker?.name || "—"}</Td>
                      <Td>{a.date ? new Date(a.date).toLocaleString() : "—"}</Td>
                      <Td>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          onClick={() => handleComplete(a._id)}
                        >
                          Mark Completed
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}

// ---------- SMALL COMPONENTS ----------
function Th({ children }) {
  return <th className="px-3 py-2 font-semibold text-left">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}