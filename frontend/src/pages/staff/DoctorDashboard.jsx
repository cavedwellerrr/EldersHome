import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { FaUserMd, FaClipboardList, FaCalendarAlt, FaClock, FaExclamationTriangle } from "react-icons/fa";

export default function DoctorDashboard() {
  const [eldersCount, setEldersCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [pendingConsultationsCount, setPendingConsultationsCount] = useState(0);
  const [urgentConsultationsCount, setUrgentConsultationsCount] = useState(0); // ✅ urgent
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

        // Next appointment
        const futureAppointments = appointments
          .filter((a) => new Date(a.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setNextAppointment(
          futureAppointments.length > 0
            ? new Date(futureAppointments[0].date)
            : null
        );

        // ✅ Fetch pending consultations
        const resConsultations = await api.get("/consultations/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const consultations = resConsultations.data || [];
        setPendingConsultationsCount(consultations.length);

        // ✅ Count urgent consultations
        const urgent = consultations.filter((c) => c.priority === "Urgent");
        setUrgentConsultationsCount(urgent.length);
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
        Welcome, Dr. {localStorage.getItem("staffName") || "User"}
      </h1>
      <p className="text-gray-700 mb-6">
        Here’s an overview of your current work:
      </p>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Appointments */}
          <DashboardCard
            title="Appointments"
            value={appointmentsCount}
            color="from-green-400 to-green-600"
            icon={<FaCalendarAlt size={32} />}
            to="/staff/doctor-dashboard/appointments"
          />
          {/* Pending Consultations */}
          <DashboardCard
            title="Pending Consultations"
            value={pendingConsultationsCount}
            color="from-blue-400 to-blue-600"
            icon={<FaClipboardList size={32} />}
            to="/staff/doctor-dashboard/consultations"
          />
          {/* Urgent Consultations */}
          <DashboardCard
            title="Urgent Consultations"
            value={urgentConsultationsCount}
            color="from-red-400 to-red-600"
            icon={<FaExclamationTriangle size={32} />}
            to="/staff/doctor-dashboard/consultations"
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
            icon={<FaClock size={32} />}
            highlight
            to="/staff/doctor-dashboard/appointments"
          />
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, value, color, icon, highlight, to }) {
  const CardContent = (
    <div
      className={`flex items-center justify-between rounded-2xl shadow-lg p-6 bg-gradient-to-r ${color} text-white transform transition hover:scale-105 cursor-pointer ${
        highlight ? "lg:col-span-2" : ""
      }`}
    >
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className="opacity-90">{icon}</div>
    </div>
  );

  return to ? <Link to={to}>{CardContent}</Link> : CardContent;
}