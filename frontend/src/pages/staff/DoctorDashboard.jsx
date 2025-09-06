// frontend/src/pages/staff/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api";

export default function DoctorDashboard() {
  const [eldersCount, setEldersCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [pendingConsultationsCount, setPendingConsultationsCount] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    localStorage.getItem("staffToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // ✅ Fetch appointments
        const resAppointments = await api.get("/appointments/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appointments = resAppointments.data || [];
        setAppointmentsCount(appointments.length);

        // Elders count = unique elders
        const uniqueElders = new Set(appointments.map((a) => a.elder?._id));
        setEldersCount(uniqueElders.size);

        // Next appointment = earliest future date
        const futureAppointments = appointments
          .filter((a) => new Date(a.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (futureAppointments.length > 0) {
          setNextAppointment(new Date(futureAppointments[0].date));
        } else {
          setNextAppointment(null);
        }

        // ✅ Fetch pending consultations
        const resConsultations = await api.get("/consultations/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingConsultationsCount(resConsultations.data?.length || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">
        Welcome, Dr. {localStorage.getItem("doctorName") || "User"}
      </h1>
      <p className="text-gray-700 mb-6">
        Here’s an overview of your current work:
      </p>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Elders Assigned */}
          <DashboardCard
            title="Elders Assigned"
            value={eldersCount}
            color="from-orange-400 to-orange-600"
          />
          {/* Appointments */}
          <DashboardCard
            title="Appointments"
            value={appointmentsCount}
            color="from-green-400 to-green-600"
          />
          {/* Pending Consultations */}
          <DashboardCard
            title="Pending Consultations"
            value={pendingConsultationsCount}
            color="from-blue-400 to-blue-600"
          />
          {/* Next Appointment */}
          <DashboardCard
            title="Next Appointment"
            value={
              nextAppointment
                ? nextAppointment.toLocaleString()
                : "No upcoming"
            }
            color="from-purple-400 to-purple-600"
          />
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value, color }) {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 bg-gradient-to-r ${color} text-white`}
    >
      <p className="text-lg font-medium">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
